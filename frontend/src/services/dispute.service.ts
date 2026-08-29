import { apiClient } from './api';
import { ApiResponse } from '../types';

export const DisputeService = {
  async createDispute(data: {
    transactionId: string;
    reason: string;
    description: string;
    evidenceUrl?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/disputes', data);
    return res.data;
  },

  async getUserDisputes(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/disputes/my');
    return res.data;
  },

  async getAllDisputes(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/disputes');
    return res.data;
  },

  async resolveDispute(id: string, data: { status: string; resolutionNotes?: string }): Promise<ApiResponse> {
    const res = await apiClient.patch<ApiResponse>(`/disputes/${id}/resolve`, data);
    return res.data;
  },
};
