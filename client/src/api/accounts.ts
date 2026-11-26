import { apiRequest } from './client';
import type { Account } from './types';

export const getAccounts = () => apiRequest<Account[]>('/api/accounts');