import { Router } from 'express';
import {
    getExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    uploadReceipt as uploadReceiptHandler,
} from '../controllers/expense.controller';
import { authenticate, validate, uploadReceipt } from '../middleware';
import { createExpenseSchema, updateExpenseSchema } from '../utils';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses with filtering and pagination
 *     tags: [Expenses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: minAmount
 *         schema: { type: number }
 *       - in: query
 *         name: maxAmount
 *         schema: { type: number }
 *     responses:
 *       200: { description: List of expenses }
 */
router.get('/', getExpenses);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Expense details }
 *       404: { description: Expense not found }
 */
router.get('/:id', getExpense);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create new expense
 *     tags: [Expenses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, category, date, description]
 *             properties:
 *               amount: { type: number }
 *               category: { type: string }
 *               date: { type: string, format: date }
 *               description: { type: string }
 *               paymentMethod: { type: string }
 *               isRecurring: { type: boolean }
 *               recurringFrequency: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Expense created }
 */
router.post('/', validate(createExpenseSchema), createExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Expense updated }
 */
router.put('/:id', validate(updateExpenseSchema), updateExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Expense deleted }
 */
router.delete('/:id', deleteExpense);

/**
 * @swagger
 * /api/expenses/{id}/receipt:
 *   post:
 *     summary: Upload receipt for expense
 *     tags: [Expenses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               receipt: { type: string, format: binary }
 *     responses:
 *       200: { description: Receipt uploaded }
 */
router.post('/:id/receipt', uploadReceipt, uploadReceiptHandler);

export default router;
