import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import expenseRoutes from './expense.routes';
import categoryRoutes from './category.routes';
import incomeRoutes from './income.routes';
import budgetRoutes from './budget.routes';
import analyticsRoutes from './analytics.routes';
import exportRoutes from './export.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/expenses', expenseRoutes);
router.use('/categories', categoryRoutes);
router.use('/incomes', incomeRoutes);
router.use('/budgets', budgetRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);
router.use('/admin', adminRoutes);

export default router;
