import { authService, TokenInfo, User } from '@/services/auth.service';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthState {
  tokenInfo: TokenInfo | null;
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (phoneNumber: string, password: string) => Promise<void>;
  verifySocialToken: (accessToken: string) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    tokenInfo: null,
    user: null,
    isAuthenticated: false,
  });

  // Khôi phục trạng thái đăng nhập bằng refresh token khi component mount
  useEffect(() => {
    const refreshAuth = async () => {
      try {
        const response = await authService.refreshToken();
        setAuthState({
          tokenInfo: response.token_info,
          user: response.user,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Failed to refresh token:', error);
        setAuthState({
          tokenInfo: null,
          user: null,
          isAuthenticated: false,
        });
      }
    };

    refreshAuth();
  }, []);

  const login = async (phone_number: string, password: string) => {
    try {
      const response = await authService.login(phone_number, password);
      
      // Lưu thông tin vào state
      setAuthState({
        tokenInfo: response.token_info,
        user: response.user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const verifySocialToken = async (access_token: string) => {
    try {
      const response = await authService.verifySocialToken(access_token);
      // Lưu thông tin vào state
      setAuthState({
        tokenInfo: response.token_info,
        user: response.user,
        isAuthenticated: true,
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
      
      // Xóa thông tin khỏi state
      setAuthState({
        tokenInfo: null,
        user: null,
        isAuthenticated: false,
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
