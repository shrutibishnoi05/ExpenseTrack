import { Router } from 'express';
import {
    getIncomes,
    getIncome,
    createIncome,
    updateIncome,
    deleteIncome,
} from '../controllers/income.controller';
import { authenticate, validate } from '../middleware';
import { createIncomeSchema, updateIncomeSchema } from '../utils';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/incomes:
 *   get:
 *     summary: Get all incomes
 *     tags: [Income]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', getIncomes);

router.get('/:id', getIncome);

router.post('/', validate(createIncomeSchema), createIncome);

router.put('/:id', validate(updateIncomeSchema), updateIncome);

router.delete('/:id', deleteIncome);

export default router;
