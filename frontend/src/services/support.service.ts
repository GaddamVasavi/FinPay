import { apiClient } from './api';
import { ApiResponse } from '../types';

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
