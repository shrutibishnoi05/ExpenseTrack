import { Response, NextFunction } from 'express';
import { User, Expense, Income } from '../models';
import { AuthRequest, PaginationInfo } from '../types';
import { NotFound } from '../utils';

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
export const getAllUsers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const search = req.query.search as string;

        const filter: Record<string, unknown> = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-refreshToken -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 })
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
            data: { users },
            pagination,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user details by ID (admin only)
 * GET /api/admin/users/:id
 */
export const getUserById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw NotFound('User not found');
        }

        // Get user statistics
        const expenseCount = await Expense.countDocuments({ userId: user._id });
        const incomeCount = await Income.countDocuments({ userId: user._id });

        const expenseTotal = await Expense.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        res.json({
            success: true,
            data: {
                user,
                stats: {
                    expenseCount,
                    incomeCount,
                    totalExpenses: expenseTotal[0]?.total || 0,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Block/Unblock user (admin only)
 * PUT /api/admin/users/:id/block
 */
export const toggleBlockUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw NotFound('User not found');
        }

        // Toggle block status
        user.isBlocked = !user.isBlocked;

        // Clear refresh token if blocking
        if (user.isBlocked) {
            user.refreshToken = undefined;
        }

        await user.save();

        res.json({
            success: true,
            message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
            data: { isBlocked: user.isBlocked },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get platform statistics (admin only)
 * GET /api/admin/stats
 */
export const getPlatformStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isBlocked: false });
        const blockedUsers = await User.countDocuments({ isBlocked: true });

        // New users this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: monthStart },
        });

        // Expense statistics
        const totalExpenses = await Expense.countDocuments();
        const expenseAmountTotal = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        // Income statistics
        const totalIncomes = await Income.countDocuments();
        const incomeAmountTotal = await Income.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        // Users by registration date (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentRegistrations = await User.aggregate([
            { $match: { createdAt: { $gte: weekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    blocked: blockedUsers,
                    newThisMonth: newUsersThisMonth,
                },
                expenses: {
                    count: totalExpenses,
                    totalAmount: expenseAmountTotal[0]?.total || 0,
                },
                income: {
                    count: totalIncomes,
                    totalAmount: incomeAmountTotal[0]?.total || 0,
                },
                recentRegistrations,
            },
        });
    } catch (error) {
        next(error);
    }
};
