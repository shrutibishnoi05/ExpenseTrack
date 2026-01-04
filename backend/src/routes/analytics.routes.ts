import { Router } from 'express';
import {
    getSummary,
    getTrends,
    getYearlySummary,
    getDailySpending,
} from '../controllers/analytics.controller';
import { authenticate } from '../middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get dashboard summary statistics
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Summary data including totals, categories, budget status
 */
router.get('/summary', getSummary);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Get spending trends (last 6 months)
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: months
 *         schema: { type: integer, default: 6 }
 */
router.get('/trends', getTrends);

/**
 * @swagger
 * /api/analytics/yearly:
 *   get:
 *     summary: Get yearly summary
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 */
router.get('/yearly', getYearlySummary);

/**
 * @swagger
 * /api/analytics/daily:
 *   get:
 *     summary: Get daily spending for a month
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 */
router.get('/daily', getDailySpending);

export default router;
