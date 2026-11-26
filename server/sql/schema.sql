DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS accounts;

CREATE TABLE accounts (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  account_type    ENUM('savings', 'checking', 'credit_card') NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'INR',
  opening_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL UNIQUE,
  kind  ENUM('income', 'expense') NOT NULL
) ENGINE=InnoDB;

CREATE TABLE transactions (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_id   INT UNSIGNED NOT NULL,
  category_id  INT UNSIGNED NULL,
  txn_date     DATE NOT NULL,
  description  VARCHAR(255) NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  kind         ENUM('income', 'expense') NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_txn_account  FOREIGN KEY (account_id)  REFERENCES accounts(id),
  CONSTRAINT fk_txn_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_amount_positive CHECK (amount > 0),
  INDEX idx_txn_account_date (account_id, txn_date),
  INDEX idx_txn_date (txn_date)
) ENGINE=InnoDB;