import express from 'express';
import cors from 'cors';
import accountRoutes from './routes/accounts.routes.js';
import transactionsRouter from './routes/transactions.routes.js';
import reportsRouter from './routes/reports.routes.js';
import categoriesRouter from './routes/categories.routes.js';

const app = express();

// Allow the React app (Vite default port 5173) to call this API
app.use(cors({ origin: 'http://localhost:5173' }));

// Read JSON request bodies
app.use(express.json());

// A simple route to check the server is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/accounts', accountRoutes);

app.use('/api/transactions', transactionsRouter);

app.use('/api/reports', reportsRouter);

app.use('/api/categories', categoriesRouter);

// Runs when no route matched
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Catches errors from any route. Express needs all four parameters to recognize it.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;