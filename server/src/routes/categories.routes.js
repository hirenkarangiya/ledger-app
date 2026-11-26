import { Router } from 'express';
import * as categoryService from '../services/categories.service.js';

const router = Router();

// GET /api/categories
router.get('/', async (req, res) => {
  const categories = await categoryService.listCategories();
  res.json(categories);
});

export default router;