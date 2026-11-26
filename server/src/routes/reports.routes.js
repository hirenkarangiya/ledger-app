import { Router } from 'express';
import { z } from 'zod';
import * as reportService from '../services/reports.service.js';

const router = Router();

const yearQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

const categoryQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  kind: z.enum(['income', 'expense']).default('expense'),
});

function sendValidationError(res, zodError) {
  return res.status(400).json({
    error: 'Validation failed',
    details: zodError.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
  });
}

// GET /api/reports/monthly?year=2026
router.get('/monthly', async (req, res) => {
  const parsed = yearQuerySchema.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  const year = parsed.data.year ?? new Date().getFullYear();
  const rows = await reportService.monthlySummary(year);
  res.json({ year, months: rows });
});

// GET /api/reports/categories?year=2026&kind=expense
router.get('/categories', async (req, res) => {
  const parsed = categoryQuerySchema.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  const year = parsed.data.year ?? new Date().getFullYear();
  const rows = await reportService.categoryBreakdown(year, parsed.data.kind);
  res.json({ year, kind: parsed.data.kind, categories: rows });
});

export default router;