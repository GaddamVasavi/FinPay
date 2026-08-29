import { apiClient } from './api';
import { ApiResponse } from '../types';

export const SavingsService = {
  async getGoals(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/savings');
    return res.data;
  },

  async createGoal(data: {
    name: string;
    targetAmount: number;
    targetDate: string;
    currency?: string;
    color?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/savings', data);
    return res.data;
  },

  async contribute(id: string, data: { amount: number; note?: string }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>(`/savings/${id}/contribute`, data);
    return res.data;
  },

  async withdraw(id: string, data: { amount: number; note?: string }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>(`/savings/${id}/withdraw`, data);
    return res.data;
  },
};
