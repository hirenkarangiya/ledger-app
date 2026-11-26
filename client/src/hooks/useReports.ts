import { useQuery } from '@tanstack/react-query';
import { getCategoryReport, getMonthlyReport } from '../api/reports';

export function useMonthlyReport(year: number) {
  return useQuery({
    queryKey: ['reports', 'monthly', year],
    queryFn: () => getMonthlyReport(year),
  });
}

export function useCategoryReport(year: number, kind: 'income' | 'expense') {
  return useQuery({
    queryKey: ['reports', 'categories', year, kind],
    queryFn: () => getCategoryReport(year, kind),
  });
}