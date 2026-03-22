import { authService, FirebaseUserInfo, TokenInfo, User } from '@/services/auth.service';
import { AUTH_SESSION_CLEARED_EVENT, setAuthToken } from '@/services/axios';
import axios from 'axios';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

const REFRESH_BUFFER_RATIO = 0.8;
const MIN_REFRESH_MS = 30_000;
const MAX_REFRESH_MS = 10 * 60_000;

function computeRefreshDelay(expiresIn?: number): number {
  if (!expiresIn || expiresIn <= 0) return MIN_REFRESH_MS;
  const ms = expiresIn * 1000 * REFRESH_BUFFER_RATIO;
  return Math.max(MIN_REFRESH_MS, Math.min(ms, MAX_REFRESH_MS));
}
interface AuthState {
  tokenInfo: TokenInfo | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginResult {
  deviceLimitExceeded: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<LoginResult>;
  verifySocialToken: (userInfo: FirebaseUserInfo) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    tokenInfo: null,
    user: null,
    isAuthenticated: false,
    isLoading: true, // Bắt đầu với loading = true
  });

  useEffect(() => {
    const refreshAuth = async () => {
      try {
        const response = await authService.refreshToken();
        setAuthState({
          tokenInfo: response.token_info,
          user: response.user,
          isAuthenticated: true,
          isLoading: false, // Kết thúc loading
        });
      } catch (error) {
        console.error('Failed to refresh token:', error);
        setAuthState({
          tokenInfo: null,
          user: null,
          isAuthenticated: false,
          isLoading: false, // Kết thúc loading
        });
      }
    };

    refreshAuth();
  }, []);

  // Khi axios xóa phiên (refresh 401, v.v.) — cập nhật state, không redirect
  useEffect(() => {
    const onCleared = () => {
      setAuthState((prev) => ({
        ...prev,
        tokenInfo: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    };
    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, onCleared);
    return () => window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, onCleared);
  }, []);

  const checkingSession = useRef(false);
  const refreshTimerId = useRef<ReturnType<typeof setTimeout>>();

  const checkSession = useCallback(async () => {
    if (checkingSession.current) return;
    checkingSession.current = true;
    try {
      const response = await authService.refreshToken();
      setAuthState(prev => ({
        ...prev,
        tokenInfo: response.token_info,
        user: response.user,
      }));
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 401 || status === 403) {
        setAuthState({
          tokenInfo: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } else {
        console.error('Session check failed:', err);
      }
    } finally {
      checkingSession.current = false;
    }
  }, []);

  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const scheduleRefresh = () => {
      clearTimeout(refreshTimerId.current);
      const delay = computeRefreshDelay(authState.tokenInfo?.expires_in);
      refreshTimerId.current = setTimeout(checkSession, delay);
    };

    scheduleRefresh();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(refreshTimerId.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authState.isAuthenticated, authState.tokenInfo, checkSession]);

  // Cập nhật token trong axios khi token thay đổi
  useEffect(() => {
    setAuthToken(authState.tokenInfo?.access_token || null);
  }, [authState.tokenInfo]);

  const login = async (phone_number: string, password: string): Promise<LoginResult> => {
    try {
      const response = await authService.login(phone_number, password);
      
      setAuthState({
        tokenInfo: response.token_info,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { deviceLimitExceeded: response.device_limit_exceeded ?? false };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const verifySocialToken = async (userInfo: FirebaseUserInfo) => {
    try {
      const response = await authService.verifySocialToken(userInfo);
      // Lưu thông tin vào state
      setAuthState({
        tokenInfo: response.token_info,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.user
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      
      setAuthState({
        tokenInfo: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        token: authState.tokenInfo?.access_token || null,
        login,
        logout,
        updateUser,
        verifySocialToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
