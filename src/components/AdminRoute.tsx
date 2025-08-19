import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/404', { replace: true });
    }
  }, [user, navigate]);

  if (!user || !user.is_admin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
