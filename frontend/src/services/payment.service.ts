import { apiClient } from './api';
import { ApiResponse } from '../types';

export const PaymentService = {
  async processPayment(data: {
    merchantName: string;
    merchantCategory?: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    idempotencyKey: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/payments', data);
    return res.data;
  },

  async refundPayment(data: { paymentId: string; reason: string }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/payments/refund', data);
    return res.data;
  },

  async getPayments(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/payments');
    return res.data;
  },
};
