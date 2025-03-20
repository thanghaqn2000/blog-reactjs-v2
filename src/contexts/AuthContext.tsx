import { authService, TokenInfo, User } from '@/services/auth.service';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthState {
  tokenInfo: TokenInfo | null;
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    tokenInfo: null,
    user: null,
    isAuthenticated: false,
  });

  // Khôi phục trạng thái đăng nhập từ localStorage khi component mount
  useEffect(() => {
    const tokenInfo = localStorage.getItem('tokenInfo');
    const user = localStorage.getItem('user');

    if (tokenInfo && user) {
      setAuthState({
        tokenInfo: JSON.parse(tokenInfo),
        user: JSON.parse(user),
        isAuthenticated: true,
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      // Lưu thông tin vào state
      setAuthState({
        tokenInfo: response.token_info,
        user: response.user,
        isAuthenticated: true,
      });

      // Lưu vào localStorage
      localStorage.setItem('tokenInfo', JSON.stringify(response.token_info));
      localStorage.setItem('user', JSON.stringify(response.user));
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

      // Xóa khỏi localStorage
      localStorage.removeItem('tokenInfo');
      localStorage.removeItem('user');
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
    localStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
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
