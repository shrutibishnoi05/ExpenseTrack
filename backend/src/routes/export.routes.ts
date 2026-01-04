import { Router } from 'express';
import {
    exportToCSV,
    exportToPDF,
    getMonthlyReport,
} from '../controllers/export.controller';
import { authenticate } from '../middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/export/csv:
 *   get:
 *     summary: Export expenses to CSV
 *     tags: [Export]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema: { type: string, format: binary }
 */
router.get('/csv', exportToCSV);

/**
 * @swagger
 * /api/export/pdf:
 *   get:
 *     summary: Export expenses to PDF
 *     tags: [Export]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/pdf', exportToPDF);

/**
 * @swagger
 * /api/export/report:
 *   get:
 *     summary: Get monthly report data
 *     tags: [Export]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/report', getMonthlyReport);

export default router;
