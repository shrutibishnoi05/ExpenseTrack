import { Response, NextFunction } from 'express';
import { Expense, Category } from '../models';
import { AuthRequest, QueryParams, PaginationInfo } from '../types';
import { NotFound, BadRequest, Forbidden } from '../utils';
import mongoose from 'mongoose';

/**
 * Build filter query from request parameters
 */
const buildExpenseFilter = (userId: string, query: QueryParams) => {
    const filter: Record<string, unknown> = { userId };

    // Date range filter
    if (query.startDate || query.endDate) {
        filter.date = {};
        if (query.startDate) {
            (filter.date as Record<string, Date>).$gte = new Date(query.startDate);
        }
        if (query.endDate) {
            (filter.date as Record<string, Date>).$lte = new Date(query.endDate);
        }
    }

    // Category filter
    if (query.category) {
        filter.category = new mongoose.Types.ObjectId(query.category);
    }

    // Amount range filter
    if (query.minAmount || query.maxAmount) {
        filter.amount = {};
        if (query.minAmount) {
            (filter.amount as Record<string, number>).$gte = Number(query.minAmount);
        }
        if (query.maxAmount) {
            (filter.amount as Record<string, number>).$lte = Number(query.maxAmount);
        }
    }

    // Text search
    if (query.search) {
        filter.$or = [
            { description: { $regex: query.search, $options: 'i' } },
            { notes: { $regex: query.search, $options: 'i' } },
        ];
    }

    return filter;
};

/**
 * Get all expenses with filtering and pagination
 * GET /api/expenses
 */
export const getExpenses = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query: QueryParams = {
            page: Number(req.query.page) || 1,
            limit: Math.min(Number(req.query.limit) || 10, 100), // Max 100 per page
            sortBy: (req.query.sortBy as string) || 'date',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            category: req.query.category as string,
            search: req.query.search as string,
            minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
            maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
        };

        const filter = buildExpenseFilter(req.user!.userId, query);

        // Count total documents
        const total = await Expense.countDocuments(filter);

        // Build sort object
        const sort: Record<string, 1 | -1> = {
            [query.sortBy!]: query.sortOrder === 'asc' ? 1 : -1,
        };

        // Fetch expenses with pagination
        const expenses = await Expense.find(filter)
            .populate('category', 'name color icon')
            .sort(sort)
            .skip((query.page! - 1) * query.limit!)
            .limit(query.limit!);

        const totalPages = Math.ceil(total / query.limit!);
        const pagination: PaginationInfo = {
            page: query.page!,
            limit: query.limit!,
            total,
            totalPages,
            hasNextPage: query.page! < totalPages,
            hasPrevPage: query.page! > 1,
        };

        res.json({
            success: true,
            data: { expenses },
            pagination,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single expense by ID
 * GET /api/expenses/:id
 */
export const getExpense = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const expense = await Expense.findById(req.params.id).populate(
            'category',
            'name color icon'
        );

        if (!expense) {
            throw NotFound('Expense not found');
        }

        // Check ownership
        if (expense.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only access your own expenses');
        }

        res.json({
            success: true,
            data: { expense },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new expense
 * POST /api/expenses
 */
export const createExpense = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {
            amount,
            category,
            date,
            description,
            paymentMethod,
            isRecurring,
            recurringFrequency,
            notes,
        } = req.body;

        // Verify category exists
        const categoryDoc = await Category.findById(category);
        if (!categoryDoc) {
            throw BadRequest('Invalid category');
        }

        // Check if category belongs to user or is default
        if (categoryDoc.userId && categoryDoc.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only use your own categories');
        }

        const expense = await Expense.create({
            userId: req.user!.userId,
            amount,
            category,
            date: new Date(date),
            description,
            paymentMethod,
            isRecurring,
            recurringFrequency,
            notes,
        });

        await expense.populate('category', 'name color icon');

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: { expense },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update expense
 * PUT /api/expenses/:id
 */
export const updateExpense = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            throw NotFound('Expense not found');
        }

        // Check ownership
        if (expense.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only update your own expenses');
        }

        // If updating category, verify it exists and is accessible
        if (req.body.category) {
            const categoryDoc = await Category.findById(req.body.category);
            if (!categoryDoc) {
                throw BadRequest('Invalid category');
            }
            if (categoryDoc.userId && categoryDoc.userId.toString() !== req.user!.userId) {
                throw Forbidden('You can only use your own categories');
            }
        }

        // Update fields
        Object.keys(req.body).forEach((key) => {
            if (key === 'date') {
                expense.set(key, new Date(req.body[key]));
            } else {
                expense.set(key, req.body[key]);
            }
        });

        await expense.save();
        await expense.populate('category', 'name color icon');

        res.json({
            success: true,
            message: 'Expense updated successfully',
            data: { expense },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete expense
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            throw NotFound('Expense not found');
        }

        // Check ownership
        if (expense.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only delete your own expenses');
        }

        await expense.deleteOne();

        res.json({
            success: true,
            message: 'Expense deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload receipt for expense
 * POST /api/expenses/:id/receipt
 */
export const uploadReceipt = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.file) {
            throw BadRequest('No file uploaded');
        }

        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            throw NotFound('Expense not found');
        }

        // Check ownership
        if (expense.userId.toString() !== req.user!.userId) {
            throw Forbidden('You can only update your own expenses');
        }

        expense.receiptUrl = `/${req.file.path.replace(/\\/g, '/')}`;
        await expense.save();

        res.json({
            success: true,
            message: 'Receipt uploaded successfully',
            data: { receiptUrl: expense.receiptUrl },
        });
    } catch (error) {
        next(error);
    }
};
