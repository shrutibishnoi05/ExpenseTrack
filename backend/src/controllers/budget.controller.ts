import { Response, NextFunction } from 'express';
import { Budget } from '../models';
import { AuthRequest } from '../types';
import { NotFound, Forbidden, Conflict } from '../utils';

/**
 * Get all budgets for user
 * GET /api/budgets
 */
export const getBudgets = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const budgets = await Budget.find({ userId: req.user!.userId })
            .populate('categoryLimits.category', 'name color')
            .sort({ year: -1, month: -1 });

        res.json({
            success: true,
            data: { budgets },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get budget for specific month/year
 * GET /api/budgets/:year/:month
 */
export const getBudgetByMonth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { year, month } = req.params;

        const budget = await Budget.findOne({
            userId: req.user!.userId,
            year: Number(year),
            month: Number(month),
        }).populate('categoryLimits.category', 'name color');

        if (!budget) {
            throw NotFound('Budget not found for this period');
        }

        res.json({
            success: true,
            data: { budget },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current month's budget
 * GET /api/budgets/current
 */
export const getCurrentBudget = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const budget = await Budget.findOne({
            userId: req.user!.userId,
            year: currentYear,
            month: currentMonth,
        }).populate('categoryLimits.category', 'name color');

        res.json({
            success: true,
            data: { budget }, // null if no budget set
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create budget
 * POST /api/budgets
 */
export const createBudget = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { month, year, limit, categoryLimits } = req.body;

        // Check for existing budget for this month/year
        const existingBudget = await Budget.findOne({
            userId: req.user!.userId,
            month,
            year,
        });

        if (existingBudget) {
            throw Conflict('Budget already exists for this period. Use PUT to update.');
        }

        const budget = await Budget.create({
            userId: req.user!.userId,
            month,
            year,
            limit,
            categoryLimits: categoryLimits || [],
        });

        await budget.populate('categoryLimits.category', 'name color');

        res.status(201).json({
            success: true,
            message: 'Budget created successfully',
            data: { budget },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update budget
 * PUT /api/budgets/:id
 */
export const updateBudget = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            throw NotFound('Budget not found');
        }

        if (budget.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only update your own budgets');
        }

        const { limit, categoryLimits } = req.body;

        if (limit !== undefined) budget.limit = limit;
        if (categoryLimits) budget.categoryLimits = categoryLimits;

        await budget.save();
        await budget.populate('categoryLimits.category', 'name color');

        res.json({
            success: true,
            message: 'Budget updated successfully',
            data: { budget },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete budget
 * DELETE /api/budgets/:id
 */
export const deleteBudget = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            throw NotFound('Budget not found');
        }

        if (budget.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only delete your own budgets');
        }

        await budget.deleteOne();

        res.json({
            success: true,
            message: 'Budget deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
