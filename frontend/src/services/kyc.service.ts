import { apiClient } from './api';
import { ApiResponse } from '../types';

export const KYCService = {
  async getProfile(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/kyc/profile');
    return res.data;
  },

  async submitKYC(data: {
    documentType: string;
    documentNumber: string;
    documentExpiry?: string;
    documentFrontUrl: string;
    documentBackUrl?: string;
    selfieUrl?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/kyc/submit', data);
    return res.data;
  },

  async getPending(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/kyc/pending');
    return res.data;
  },

  async reviewKYC(id: string, decision: { status: string; notes?: string; rejectionReason?: string }): Promise<ApiResponse> {
    const res = await apiClient.patch<ApiResponse>(`/kyc/${id}/review`, decision);
    return res.data;
  },
};
