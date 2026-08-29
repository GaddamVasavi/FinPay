import { apiClient } from './api';
import { ApiResponse } from '../types';

export const BankAccountService = {
  async getAccounts(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/bank-accounts');
    return res.data;
  },

  async linkAccount(data: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    routingNumber?: string;
    currency?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/bank-accounts', data);
    return res.data;
  },

  async setDefault(id: string): Promise<ApiResponse> {
    const res = await apiClient.patch<ApiResponse>(`/bank-accounts/${id}/default`);
    return res.data;
  },

  async remove(id: string): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/bank-accounts/${id}`);
    return res.data;
  },
};

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
