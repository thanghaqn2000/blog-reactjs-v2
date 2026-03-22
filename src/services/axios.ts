import { API_CONFIG } from '@/config/api.config';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/** Tên sự kiện: axios đã xóa phiên (refresh 401…); AuthContext lắng nghe để đồng bộ state */
export const AUTH_SESSION_CLEARED_EVENT = 'orca-auth-session-cleared';

function notifySessionCleared() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_CLEARED_EVENT));
  }
}

// Tạo instance cho v1 API
export const v1Api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.V1_PREFIX}`,
});

// Tạo instance cho admin API (mặc định reject với status không thuộc 2xx, để try/catch ở caller bắt được 4xx/5xx)
export const adminApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN_PREFIX}`,
});

// Tạo một object để lưu trữ token
export const tokenStore = {
  token: null as string | null,
  setToken: function (newToken: string | null) {
    this.token = newToken;
  },
  getToken: function () {
    return this.token;
  },
};

// Hàm để cập nhật token
export const setAuthToken = (token: string | null) => {
  tokenStore.setToken(token);
};

function clearDefaultAuthHeaders() {
  const clear = (instance: typeof v1Api) => {
    const common = instance.defaults.headers?.common as Record<string, string> | undefined;
    if (common && 'JWTAuthorization' in common) {
      delete common.JWTAuthorization;
    }
  };
  clear(v1Api);
  clear(adminApi);
}

/**
 * BE khi refresh không hợp lệ thường trả 401 + body dạng:
 * `{ "error": "Phiên đăng nhập đã hết hạn hoặc bị thu hồi", "status": 401 }` — đúng nghiệp vụ.
 * FE xử lý trong interceptor: xóa phiên, không redirect /login (ProtectedRoute lo route cần auth).
 */
function isRefreshRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? '';
  return typeof url === 'string' && url.includes('refresh_tokens');
}

/** Gọi refresh một lần; nhiều request 401 cùng lúc dùng chung promise này (lock) */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await v1Api.post<{ token_info: { access_token: string }; user: unknown }>(
        '/refresh_tokens',
        {},
        { withCredentials: true }
      );
      const newToken = res.data?.token_info?.access_token ?? null;
      if (newToken) {
        setAuthToken(newToken);
        setDefaultAuthHeader(v1Api, newToken);
        setDefaultAuthHeader(adminApi, newToken);
      }
      return newToken;
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 401 || status === 403) {
        setAuthToken(null);
        clearDefaultAuthHeaders();
        notifySessionCleared();
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function setDefaultAuthHeader(
  instance: typeof v1Api | typeof adminApi,
  token: string
): void {
  if (!instance.defaults.headers) instance.defaults.headers = {} as typeof instance.defaults.headers;
  instance.defaults.headers.common = instance.defaults.headers.common ?? {};
  (instance.defaults.headers.common as Record<string, string>).JWTAuthorization = `Bearer ${token}`;
}

function handleSessionExpired(): void {
  setAuthToken(null);
  clearDefaultAuthHeaders();
  notifySessionCleared();
}

function createUnauthorizedInterceptor(instance: typeof v1Api | typeof adminApi) {
  return async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isUnauthorizedOrForbidden = status === 401 || status === 403;
    if (!isUnauthorizedOrForbidden || !config) return Promise.reject(error);

    if (isRefreshRequest(config)) {
      handleSessionExpired();
      return Promise.reject(error);
    }

    if (status === 403) return Promise.reject(error);

    if (config._retry) return Promise.reject(error);

    const newToken = await refreshAccessToken();
    if (!newToken) return Promise.reject(error);

    config._retry = true;
    if (!config.headers) config.headers = {} as InternalAxiosRequestConfig['headers'];
    config.headers.JWTAuthorization = `Bearer ${newToken}`;
    return instance(config);
  };
}

// Thêm interceptor cho v1 API để tự động thêm token
v1Api.interceptors.request.use(
  (config) => {
    const token = tokenStore.getToken();
    if (token) {
      config.headers.JWTAuthorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor cho admin API để tự động thêm token
adminApi.interceptors.request.use(
  (config) => {
    const token = tokenStore.getToken();
    if (token) {
      config.headers.JWTAuthorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response: khi 401 thì refresh rồi retry; refresh thất bại thì xóa phiên + event (không redirect /login)
v1Api.interceptors.response.use((res) => res, createUnauthorizedInterceptor(v1Api));
adminApi.interceptors.response.use((res) => res, createUnauthorizedInterceptor(adminApi));
