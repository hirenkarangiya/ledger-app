INSERT INTO categories (name, kind) VALUES
  ('Salary',     'income'),   -- id 1
  ('Freelance',  'income'),   -- id 2
  ('Groceries',  'expense'),  -- id 3
  ('Rent',       'expense'),  -- id 4
  ('Dining Out', 'expense'),  -- id 5
  ('Transport',  'expense'),  -- id 6
  ('Utilities',  'expense'),  -- id 7
  ('Shopping',   'expense');  -- id 8

INSERT INTO accounts (name, account_type, opening_balance) VALUES
  ('HDFC Savings',      'savings',     50000.00),  -- id 1
  ('ICICI Credit Card', 'credit_card',     0.00);  -- id 2

INSERT INTO transactions (account_id, category_id, txn_date, description, amount, kind) VALUES
  (1, 1, '2026-10-01', 'October salary',       85000.00, 'income'),
  (1, 4, '2026-10-02', 'October rent',         25000.00, 'expense'),
  (1, 3, '2026-10-05', 'Big bazaar groceries',  6200.00, 'expense'),
  (2, 5, '2026-10-09', 'Dinner with friends',   1850.00, 'expense'),
  (2, 6, '2026-10-12', 'Cab rides',             2400.00, 'expense'),
  (1, 7, '2026-10-15', 'Electricity bill',      3100.00, 'expense'),
  (1, 2, '2026-10-20', 'Client project payment',20000.00, 'income'),
  (2, 8, '2026-10-22', 'Online shopping',       8999.00, 'expense'),
  (1, 1, '2026-11-01', 'November salary',      85000.00, 'income'),
  (1, 4, '2026-11-02', 'November rent',        25000.00, 'expense'),
  (1, 3, '2026-11-04', 'Groceries',             5800.00, 'expense'),
  (2, 5, '2026-11-08', 'Team lunch',            2300.00, 'expense'),
  (2, 6, '2026-11-10', 'Metro and auto',        1900.00, 'expense'),
  (1, 7, '2026-11-14', 'Internet and water',    2950.00, 'expense'),
  (1, 2, '2026-11-20', 'Freelance invoice',    15000.00, 'income');