import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('finpay_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for refresh token rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('finpay_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          if (res.data?.success && res.data?.data?.accessToken) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data;
            localStorage.setItem('finpay_access_token', accessToken);
            localStorage.setItem('finpay_refresh_token', newRefreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('finpay_access_token');
          localStorage.removeItem('finpay_refresh_token');
          localStorage.removeItem('finpay_user');
          window.location.href = '/login?expired=true';
        }
      }
    }

    return Promise.reject(error);
  }
);
