import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Overrides DB_NAME from .env, so tests use the test database
    env: { DB_NAME: 'ledger_app_test' },
    hookTimeout: 20000,
  },
});