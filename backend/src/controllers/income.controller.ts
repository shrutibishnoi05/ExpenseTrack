import { Response, NextFunction } from 'express';
import { Income } from '../models';
import { AuthRequest, PaginationInfo } from '../types';
import { NotFound, Forbidden } from '../utils';

/**
 * Get all incomes with pagination
 * GET /api/incomes
 */
export const getIncomes = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 100);
        const sortBy = (req.query.sortBy as string) || 'date';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const filter = { userId: req.user!.userId };

        // Date filters
        if (req.query.startDate || req.query.endDate) {
            const dateFilter: Record<string, Date> = {};
            if (req.query.startDate) dateFilter.$gte = new Date(req.query.startDate as string);
            if (req.query.endDate) dateFilter.$lte = new Date(req.query.endDate as string);
            Object.assign(filter, { date: dateFilter });
        }

        const total = await Income.countDocuments(filter);
        const incomes = await Income.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalPages = Math.ceil(total / limit);
        const pagination: PaginationInfo = {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        res.json({
            success: true,
            data: { incomes },
            pagination,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single income by ID
 * GET /api/incomes/:id
 */
export const getIncome = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            throw NotFound('Income not found');
        }

        if (income.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only access your own income records');
        }

        res.json({
            success: true,
            data: { income },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create income
 * POST /api/incomes
 */
export const createIncome = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { source, amount, date, description, isRecurring, recurringFrequency } = req.body;

        const income = await Income.create({
            userId: req.user!.userId,
            source,
            amount,
            date: new Date(date),
            description,
            isRecurring,
            recurringFrequency,
        });

        res.status(201).json({
            success: true,
            message: 'Income created successfully',
            data: { income },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update income
 * PUT /api/incomes/:id
 */
export const updateIncome = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            throw NotFound('Income not found');
        }

        if (income.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only update your own income records');
        }

        Object.keys(req.body).forEach((key) => {
            if (key === 'date') {
                income.set(key, new Date(req.body[key]));
            } else {
                income.set(key, req.body[key]);
            }
        });

        await income.save();

        res.json({
            success: true,
            message: 'Income updated successfully',
            data: { income },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete income
 * DELETE /api/incomes/:id
 */
export const deleteIncome = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            throw NotFound('Income not found');
        }

        if (income.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only delete your own income records');
        }

        await income.deleteOne();

        res.json({
            success: true,
            message: 'Income deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
