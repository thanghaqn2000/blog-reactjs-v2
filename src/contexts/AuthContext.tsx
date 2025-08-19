import { authService, FirebaseUserInfo, TokenInfo, User } from '@/services/auth.service';
import { setAuthToken } from '@/services/axios';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
interface AuthState {
  tokenInfo: TokenInfo | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
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

  // Cập nhật token trong axios khi token thay đổi
  useEffect(() => {
    setAuthToken(authState.tokenInfo?.access_token || null);
  }, [authState.tokenInfo]);

  const login = async (phone_number: string, password: string) => {
    try {
      const response = await authService.login(phone_number, password);
      
      setAuthState({
        tokenInfo: response.token_info,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
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
