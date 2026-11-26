// MySQL returns DECIMAL values as strings, so money fields are typed as strings.
export interface Account {
  id: number;
  name: string;
  account_type: 'savings' | 'checking' | 'credit_card';
  currency: string;
  opening_balance: string;
  current_balance: string;
}

export interface TransactionPage {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface Transaction {
  id: number;
  account_id: number;
  account_name: string;
  category_id: number | null;
  category_name: string | null;
  txn_date: string;
  description: string;
  amount: string;
  kind: 'income' | 'expense';
}

export interface TransactionFilters {
  from?: string;
  to?: string;
  account_id?: number;
  kind?: 'income' | 'expense';
  page: number;
  limit: number;
}

export interface Category {
  id: number;
  name: string;
  kind: 'income' | 'expense';
}

export interface NewTransaction {
  account_id: number;
  category_id: number | null;
  txn_date: string;
  description: string;
  amount: number;
  kind: 'income' | 'expense';
}

export interface MonthlyRow {
  month: string;
  income: string;
  expense: string;
  net: string;
}

export interface MonthlyReport {
  year: number;
  months: MonthlyRow[];
}

export interface CategoryRow {
  category: string;
  transaction_count: number;
  total: string;
}

export interface CategoryReport {
  year: number;
  kind: 'income' | 'expense';
  categories: CategoryRow[];
}
