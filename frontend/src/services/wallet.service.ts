import { apiClient } from './api';
import { ApiResponse } from '../types';

export const WalletService = {
  async getOverview(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/wallets/overview');
    return res.data;
  },

  async addFunds(data: {
    amount: number;
    currency: string;
    paymentMethod: string;
    sourceAccountId?: string;
    idempotencyKey: string;
    description?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/wallets/add-funds', data);
    return res.data;
  },

  async withdrawFunds(data: {
    amount: number;
    currency: string;
    destinationBankAccountId: string;
    idempotencyKey: string;
    description?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/wallets/withdraw', data);
    return res.data;
  },

  async getTransactions(params?: any): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/wallets/transactions', { params });
    return res.data;
  },

  async generateStatement(data: {
    startDate: string;
    endDate: string;
    format: string;
    currency?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/wallets/statement', data);
    return res.data;
  },
};
