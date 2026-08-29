import { apiClient } from './api';
import { ApiResponse } from '../types';

export const BeneficiaryService = {
  async getAll(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/beneficiaries');
    return res.data;
  },

  async create(data: {
    name: string;
    email?: string;
    accountNumberMasked?: string;
    routingNumber?: string;
    bankName?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/beneficiaries', data);
    return res.data;
  },

  async remove(id: string): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/beneficiaries/${id}`);
    return res.data;
  },
};
