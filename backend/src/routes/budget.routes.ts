import { Router } from 'express';
import {
    getBudgets,
    getBudgetByMonth,
    getCurrentBudget,
    createBudget,
    updateBudget,
    deleteBudget,
} from '../controllers/budget.controller';
import { authenticate, validate } from '../middleware';
import { createBudgetSchema, updateBudgetSchema } from '../utils';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Budgets]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', getBudgets);

/**
 * @swagger
 * /api/budgets/current:
 *   get:
 *     summary: Get current month's budget
 *     tags: [Budgets]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/current', getCurrentBudget);

router.get('/:year/:month', getBudgetByMonth);

router.post('/', validate(createBudgetSchema), createBudget);

router.put('/:id', validate(updateBudgetSchema), updateBudget);

router.delete('/:id', deleteBudget);

export default router;
