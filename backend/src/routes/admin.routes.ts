import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    toggleBlockUser,
    getPlatformStats,
} from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of users }
 *       403: { description: Admin access required }
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/users/:id', getUserById);

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   put:
 *     summary: Toggle block user (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/users/:id/block', toggleBlockUser);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get platform statistics (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/stats', getPlatformStats);

export default router;
