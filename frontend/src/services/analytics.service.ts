import { apiClient } from './api';
import { ApiResponse } from '../types';

export const AnalyticsService = {
  async getOverview(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/analytics/overview');
    return res.data;
  },
};
