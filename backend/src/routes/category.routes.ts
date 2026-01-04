import { Router } from 'express';
import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller';
import { authenticate, validate } from '../middleware';
import { createCategorySchema, updateCategorySchema } from '../utils';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories (default + custom)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of categories }
 */
router.get('/', getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', getCategory);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create custom category
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', validate(createCategorySchema), createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id', validate(updateCategorySchema), updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', deleteCategory);

export default router;
