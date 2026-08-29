import { apiClient } from './api';
import { ApiResponse } from '../types';

export const BudgetService = {
  async getCategories(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/budgeting/categories');
    return res.data;
  },

  async addExpense(data: {
    categoryId: string;
    amount: number;
    currency?: string;
    date: string;
    description: string;
    isRecurring?: boolean;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/budgeting/expenses', data);
    return res.data;
  },

  async getExpenses(month?: number, year?: number): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/budgeting/expenses', {
      params: { month, year },
    });
    return res.data;
  },

  async addIncome(data: {
    source: string;
    amount: number;
    currency?: string;
    date: string;
    category?: string;
    isRecurring?: boolean;
    description?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/budgeting/income', data);
    return res.data;
  },

  async getIncomes(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/budgeting/income');
    return res.data;
  },

  async setBudget(data: {
    name: string;
    month: number;
    year: number;
    categories: Array<{ categoryId: string; limit: number }>;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/budgeting/budget', data);
    return res.data;
  },

  async getBudget(year: number, month: number): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>(`/budgeting/budget/${year}/${month}`);
    return res.data;
  },
};

export const SavingsService = {
  async getGoals(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/savings');
    return res.data;
  },

  async createGoal(data: {
    name: string;
    targetAmount: number;
    targetDate: string;
    currency?: string;
    color?: string;
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/savings', data);
    return res.data;
  },

  async contribute(id: string, data: { amount: number; note?: string }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>(`/savings/${id}/contribute`, data);
    return res.data;
  },

  async withdraw(id: string, data: { amount: number; note?: string }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>(`/savings/${id}/withdraw`, data);
    return res.data;
  },
};

export const AnalyticsService = {
  async getOverview(): Promise<ApiResponse> {
    const res = await apiClient.get<ApiResponse>('/analytics/overview');
    return res.data;
  },
};
