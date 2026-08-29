import { apiClient } from './api';
import { ApiResponse } from '../types';

export const TransferService = {
  async sendTransfer(data: {
    recipientEmail: string;
    amount: number;
    currency?: string;
    note?: string;
    idempotencyKey: string;
    saveBeneficiary?: boolean;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/transfers/send', data);
    return res.data;
  },

  async getHistory(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/transfers/history');
    return res.data;
  },

  async getReceipt(ref: string): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>(`/transfers/receipt/${ref}`);
    return res.data;
  },

  // Payment Requests
  async createPaymentRequest(data: {
    payerEmail: string;
    amount: number;
    currency?: string;
    description?: string;
    expiryDays?: number;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/payment-requests', data);
    return res.data;
  },

  async getPaymentRequests(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/payment-requests');
    return res.data;
  },

  async acceptPaymentRequest(id: string): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>(`/payment-requests/${id}/accept`);
    return res.data;
  },

  async rejectPaymentRequest(id: string): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>(`/payment-requests/${id}/reject`);
    return res.data;
  },

  // Scheduled Payments
  async getScheduledPayments(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/scheduled-payments');
    return res.data;
  },

  async createScheduledPayment(data: {
    recipientName: string;
    recipientAccount: string;
    amount: number;
    currency: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/scheduled-payments', data);
    return res.data;
  },

  async cancelScheduledPayment(id: string): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/scheduled-payments/${id}`);
    return res.data;
  },
};
