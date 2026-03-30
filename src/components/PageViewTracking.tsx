import { trackPageView, pathnameToPageType } from '@/services/v1/track-view.service';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Gọi trong BrowserRouter; song song với Google Analytics, không dùng auth. */
export function PageViewTracking() {
  const location = useLocation();

  useEffect(() => {
    const pageType = pathnameToPageType(location.pathname);
    if (pageType) void trackPageView(pageType);
  }, [location.pathname]);

  return null;
}
