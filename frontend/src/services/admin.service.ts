import { apiClient } from './api';
import { ApiResponse } from '../types';

export const AdminService = {
  async getStats(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/admin/stats');
    return res.data;
  },

  async getUsers(params?: { search?: string; status?: string }): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(id: string, data: { status: string; reason?: string }): Promise<ApiResponse> {
    const res = await apiClient.patch<ApiResponse>(`/admin/users/${id}/status`, data);
    return res.data;
  },

  async getRiskAlerts(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/admin/risk-alerts');
    return res.data;
  },

  async reviewRiskAlert(id: string, data: { status: string; notes?: string }): Promise<ApiResponse> {
    const res = await apiClient.patch<ApiResponse>(`/admin/risk-alerts/${id}/review`, data);
    return res.data;
  },

  async getAuditLogs(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/admin/audit-logs');
    return res.data;
  },
};

export const SupportService = {
  async createTicket(data: {
    subject: string;
    message: string;
    category?: string;
    priority?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/support', data);
    return res.data;
  },

  async getUserTickets(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/support/my');
    return res.data;
  },

  async getAllTickets(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/support');
    return res.data;
  },

  async updateTicket(id: string, data: { status: string; resolution?: string }): Promise<ApiResponse> {
    const res = await apiClient.patch<ApiResponse>(`/support/${id}`, data);
    return res.data;
  },
};

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
