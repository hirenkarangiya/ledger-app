import { apiRequest } from './client';
import type { NewTransaction, Transaction, TransactionFilters, TransactionPage } from './types';

export function getTransactions(filters: TransactionFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return apiRequest<TransactionPage>(`/api/transactions?${params.toString()}`);
}

export const createTransaction = (data: NewTransaction) =>
  apiRequest<Transaction>('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
});