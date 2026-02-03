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
    // Chỉ redirect sau khi đã load xong trạng thái auth
    if (!isLoading && (!user || !user.is_admin)) {
      navigate('/404', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Hiển thị loading khi đang kiểm tra quyền
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Nếu không phải admin (sau khi đã load xong), sẽ được redirect bởi useEffect
  if (!user || !user.is_admin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
