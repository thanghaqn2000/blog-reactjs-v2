import { trackPageView } from '@/lib/analytics';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Gọi bên trong BrowserRouter để gửi pageview mỗi khi đổi route (SPA). */
export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}
