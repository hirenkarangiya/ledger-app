import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getTransactions } from '../api/transactions';
import type { TransactionFilters } from '../api/types';

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getTransactions(filters),
    placeholderData: keepPreviousData,
  });
}