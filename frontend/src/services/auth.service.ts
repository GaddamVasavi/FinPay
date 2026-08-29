import { apiClient } from './api';
import { ApiResponse, User } from '../types';

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  user: User;
}

export const AuthService = {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/auth/register', data);
    return res.data;
  },

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<LoginResponse>> {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return res.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  async logout(): Promise<ApiResponse> {
    const refreshToken = localStorage.getItem('finpay_refresh_token');
    const res = await apiClient.post<ApiResponse>('/auth/logout', { refreshToken });
    return res.data;
  },
};
