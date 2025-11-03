import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ redirect khi không còn loading và user không hợp lệ
    if (!isLoading && (!user || !user.is_admin)) {
      navigate('/404', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Hiển thị loading khi đang khởi tạo auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Redirect nếu không có quyền (sau khi loading xong)
  if (!user || !user.is_admin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
