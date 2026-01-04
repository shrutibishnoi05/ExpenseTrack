import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Expense, Income, Budget, Category } from '../models';
import { AuthRequest } from '../types';
import { MonthlySummary, CategorySpending, TrendDataPoint } from '../types/models';

/**
 * Get dashboard summary statistics
 * GET /api/analytics/summary
 */
export const getSummary = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user!.userId);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Start and end of current month
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        // Total expenses for current month
        const expenseAgg = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: monthStart, $lte: monthEnd },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        const totalExpenses = expenseAgg[0]?.total || 0;
        const expenseCount = expenseAgg[0]?.count || 0;

        // Total income for current month
        const incomeAgg = await Income.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: monthStart, $lte: monthEnd },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);

        const totalIncome = incomeAgg[0]?.total || 0;

        // Get current month's budget
        const budget = await Budget.findOne({
            userId: req.user!.userId,
            month: currentMonth,
            year: currentYear,
        });

        const budgetLimit = budget?.limit || 0;
        const budgetUsed = totalExpenses;
        const budgetRemaining = budgetLimit - budgetUsed;
        const isOverBudget = budgetLimit > 0 && budgetUsed > budgetLimit;
        const isNearBudget = budgetLimit > 0 && budgetUsed >= budgetLimit * 0.8 && !isOverBudget;

        // Savings calculation
        const savings = totalIncome - totalExpenses;
        const savingsPercentage = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

        // Category-wise spending
        const categorySpending = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: monthStart, $lte: monthEnd },
                },
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $unwind: '$category',
            },
            {
                $project: {
                    categoryId: '$_id',
                    categoryName: '$category.name',
                    categoryColor: '$category.color',
                    total: 1,
                    count: 1,
                    percentage: {
                        $cond: [
                            { $eq: [totalExpenses, 0] },
                            0,
                            { $multiply: [{ $divide: ['$total', totalExpenses] }, 100] },
                        ],
                    },
                },
            },
            { $sort: { total: -1 } },
        ]);

        // Highest spending category
        const highestCategory = categorySpending[0] || null;

        const summary: MonthlySummary = {
            month: currentMonth,
            year: currentYear,
            totalExpenses,
            totalIncome,
            savings,
            savingsPercentage: Math.round(savingsPercentage * 100) / 100,
            budgetLimit,
            budgetUsed,
            budgetRemaining,
            isOverBudget,
            categoryBreakdown: categorySpending as CategorySpending[],
        };

        res.json({
            success: true,
            data: {
                summary,
                expenseCount,
                highestCategory,
                isNearBudget,
                budgetPercentUsed: budgetLimit > 0 ? Math.round((budgetUsed / budgetLimit) * 100) : 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get spending trends (last 6 months)
 * GET /api/analytics/trends
 */
export const getTrends = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user!.userId);
        const months = Number(req.query.months) || 6;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months + 1);
        startDate.setDate(1);

        // Monthly expense trends
        const expenseTrends = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                    },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Monthly income trends
        const incomeTrends = await Income.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                    },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Format data for charts
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const expenseData: TrendDataPoint[] = expenseTrends.map((item) => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            amount: item.total,
            label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        }));

        const incomeData: TrendDataPoint[] = incomeTrends.map((item) => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            amount: item.total,
            label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        }));

        res.json({
            success: true,
            data: {
                expenses: expenseData,
                income: incomeData,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get yearly summary
 * GET /api/analytics/yearly
 */
export const getYearlySummary = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user!.userId);
        const year = Number(req.query.year) || new Date().getFullYear();

        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);

        // Total expenses for the year
        const expenseAgg = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                    avgPerMonth: { $avg: '$amount' },
                },
            },
        ]);

        // Total income for the year
        const incomeAgg = await Income.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);

        // Monthly breakdown
        const monthlyBreakdown = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $month: '$date' },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const totalExpenses = expenseAgg[0]?.total || 0;
        const totalIncome = incomeAgg[0]?.total || 0;
        const expenseCount = expenseAgg[0]?.count || 0;

        res.json({
            success: true,
            data: {
                year,
                totalExpenses,
                totalIncome,
                savings: totalIncome - totalExpenses,
                expenseCount,
                averageMonthlyExpense: totalExpenses / 12,
                monthlyBreakdown: monthlyBreakdown.map((item) => ({
                    month: item._id,
                    total: item.total,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get daily spending for current month
 * GET /api/analytics/daily
 */
export const getDailySpending = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user!.userId);
        const now = new Date();
        const year = Number(req.query.year) || now.getFullYear();
        const month = Number(req.query.month) || now.getMonth() + 1;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const dailySpending = await Expense.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            success: true,
            data: {
                year,
                month,
                dailySpending: dailySpending.map((item) => ({
                    day: item._id,
                    total: item.total,
                    count: item.count,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};
