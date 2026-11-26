import { apiRequest } from './client';
import type { CategoryReport, MonthlyReport } from './types';

export const getMonthlyReport = (year: number) =>
  apiRequest<MonthlyReport>(`/api/reports/monthly?year=${year}`);

export const getCategoryReport = (year: number, kind: 'income' | 'expense') =>
  apiRequest<CategoryReport>(`/api/reports/categories?year=${year}&kind=${kind}`);