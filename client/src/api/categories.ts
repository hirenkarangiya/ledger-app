import { apiRequest } from './client';
import type { Category } from './types';

export const getCategories = () => apiRequest<Category[]>('/api/categories');