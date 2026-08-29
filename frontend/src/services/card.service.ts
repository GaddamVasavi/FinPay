import { apiClient } from './api';
import { ApiResponse } from '../types';

export const CardService = {
  async getCards(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/cards');
    return res.data;
  },

  async createCard(data: {
    cardType?: string;
    cardBrand?: string;
    nickname?: string;
    dailyLimit?: number;
    monthlyLimit?: number;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/cards', data);
    return res.data;
  },

  async toggleFreeze(id: string): Promise<ApiResponse> {
    const res = await apiClient.patch<ApiResponse>(`/cards/${id}/freeze`);
    return res.data;
  },

  async updateLimits(id: string, limits: { dailyLimit?: number; monthlyLimit?: number; nickname?: string }): Promise<ApiResponse> {
    const res = await apiClient.patch<ApiResponse>(`/cards/${id}/limits`, limits);
    return res.data;
  },

  async simulateAuthorization(id: string, data: { merchantName: string; amount: number }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>(`/cards/${id}/simulate-auth`, data);
    return res.data;
  },
};

export const LoanService = {
  async getLoans(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/loans');
    return res.data;
  },

  async applyLoan(data: {
    principalAmount: number;
    termMonths: number;
    purpose: string;
    annualIncome: number;
    employmentStatus: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/loans/apply', data);
    return res.data;
  },

  async repayInstallment(data: { installmentId: string; amount: number }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/loans/repay', data);
    return res.data;
  },
};
