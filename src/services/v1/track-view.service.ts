import { API_CONFIG } from '@/config/api.config';
import axios from 'axios';

/** Không dùng v1Api: không gửi Bearer, không kích hoạt interceptor refresh. */
const trackClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.V1_PREFIX}`,
  timeout: 12_000,
});

export type PageTypeForTrack = 'home' | 'top_stocks';

export function pathnameToPageType(pathname: string): PageTypeForTrack | null {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/' || p === '') return 'home';
  if (p === '/stock-insight' || p.startsWith('/stock-insight/')) return 'top_stocks';
  return null;
}

export async function trackPageView(page_type: PageTypeForTrack): Promise<void> {
  try {
    await trackClient.post('/track/view', { page_type });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const s = err.response?.status;
      if (s === 422 || s === 204) return;
    }
  }
}
