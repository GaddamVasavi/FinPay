import { apiClient } from './api';
import { ApiResponse } from '../types';

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
