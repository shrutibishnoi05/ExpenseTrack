import { z } from 'zod';

/**
 * Authentication validation schemas
 */
export const signupSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name cannot exceed 100 characters'),
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase, one lowercase, and one number'
            ),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase, one lowercase, and one number'
            ),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'New password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase, one lowercase, and one number'
            ),
    }),
});

/**
 * User profile validation schemas
 */
export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100).optional(),
        currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']).optional(),
        monthlyBudget: z.number().min(0).optional(),
    }),
});

/**
 * Expense validation schemas
 */
export const createExpenseSchema = z.object({
    body: z.object({
        amount: z.number().positive('Amount must be positive'),
        category: z.string().min(1, 'Category is required'),
        date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
        description: z.string().min(2).max(200),
        paymentMethod: z
            .enum(['cash', 'credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'other'])
            .optional(),
        isRecurring: z.boolean().optional(),
        recurringFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
        notes: z.string().max(500).optional(),
    }),
});

export const updateExpenseSchema = z.object({
    body: z.object({
        amount: z.number().positive('Amount must be positive').optional(),
        category: z.string().optional(),
        date: z.string().optional(),
        description: z.string().min(2).max(200).optional(),
        paymentMethod: z
            .enum(['cash', 'credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'other'])
            .optional(),
        isRecurring: z.boolean().optional(),
        recurringFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
        notes: z.string().max(500).optional(),
    }),
});

/**
 * Category validation schemas
 */
export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2).max(50),
        color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
        icon: z.string().optional(),
    }),
});

export const updateCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2).max(50).optional(),
        color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
        icon: z.string().optional(),
    }),
});

/**
 * Income validation schemas
 */
export const createIncomeSchema = z.object({
    body: z.object({
        source: z.string().min(2).max(100),
        amount: z.number().positive('Amount must be positive'),
        date: z.string(),
        description: z.string().max(200).optional(),
        isRecurring: z.boolean().optional(),
        recurringFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']).optional(),
    }),
});

export const updateIncomeSchema = z.object({
    body: z.object({
        source: z.string().min(2).max(100).optional(),
        amount: z.number().positive('Amount must be positive').optional(),
        date: z.string().optional(),
        description: z.string().max(200).optional(),
        isRecurring: z.boolean().optional(),
        recurringFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']).optional(),
    }),
});

/**
 * Budget validation schemas
 */
export const createBudgetSchema = z.object({
    body: z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2020).max(2100),
        limit: z.number().min(0),
        categoryLimits: z
            .array(
                z.object({
                    category: z.string(),
                    limit: z.number().min(0),
                })
            )
            .optional(),
    }),
});

export const updateBudgetSchema = z.object({
    body: z.object({
        limit: z.number().min(0).optional(),
        categoryLimits: z
            .array(
                z.object({
                    category: z.string(),
                    limit: z.number().min(0),
                })
            )
            .optional(),
    }),
});

/**
 * Common query parameter validation
 */
export const paginationSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
});

export const expenseQuerySchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        category: z.string().optional(),
        search: z.string().optional(),
        minAmount: z.string().regex(/^\d+(\.\d+)?$/).optional(),
        maxAmount: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    }),
});
