import { Response, NextFunction } from 'express';
import { Category } from '../models';
import { AuthRequest } from '../types';
import { NotFound, Forbidden, Conflict } from '../utils';

/**
 * Get all categories (default + user's custom)
 * GET /api/categories
 */
export const getCategories = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get default categories and user's custom categories
        const categories = await Category.find({
            $or: [{ isDefault: true }, { userId: req.user!.userId }],
        }).sort({ isDefault: -1, name: 1 });

        res.json({
            success: true,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single category by ID
 * GET /api/categories/:id
 */
export const getCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            throw NotFound('Category not found');
        }

        // Check access (default categories are accessible to all)
        if (!category.isDefault && category.userId?.toString() !== req.user!.userId) {
            throw Forbidden('You can only access your own categories');
        }

        res.json({
            success: true,
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create custom category
 * POST /api/categories
 */
export const createCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, color, icon } = req.body;

        // Check for duplicate category name for this user
        const existingCategory = await Category.findOne({
            userId: req.user!.userId,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
        });

        if (existingCategory) {
            throw Conflict('Category with this name already exists');
        }

        const category = await Category.create({
            userId: req.user!.userId,
            name,
            color,
            icon: icon || 'tag',
            isDefault: false,
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update category
 * PUT /api/categories/:id
 */
export const updateCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            throw NotFound('Category not found');
        }

        // Cannot edit default categories
        if (category.isDefault) {
            throw Forbidden('Default categories cannot be modified');
        }

        // Check ownership
        if (category.userId?.toString() !== req.user!.userId) {
            throw Forbidden('You can only update your own categories');
        }

        // Check for duplicate name
        if (req.body.name) {
            const existingCategory = await Category.findOne({
                userId: req.user!.userId,
                name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
                _id: { $ne: category._id },
            });

            if (existingCategory) {
                throw Conflict('Category with this name already exists');
            }
        }

        // Update fields
        Object.keys(req.body).forEach((key) => {
            category.set(key, req.body[key]);
        });

        await category.save();

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete category
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            throw NotFound('Category not found');
        }

        // Cannot delete default categories
        if (category.isDefault) {
            throw Forbidden('Default categories cannot be deleted');
        }

        // Check ownership
        if (category.userId?.toString() !== req.user!.userId) {
            throw Forbidden('You can only delete your own categories');
        }

        await category.deleteOne();

        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
