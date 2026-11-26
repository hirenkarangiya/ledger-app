import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransaction } from '../api/transactions';

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Mark these as stale so the table and balances refetch
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}