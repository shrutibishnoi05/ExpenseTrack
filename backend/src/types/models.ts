import { Document, Types } from 'mongoose';

/**
 * Payment method enumeration
 */
export enum PaymentMethod {
    CASH = 'cash',
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    UPI = 'upi',
    NET_BANKING = 'net_banking',
    WALLET = 'wallet',
    OTHER = 'other',
}

/**
 * Expense document interface
 */
export interface IExpense extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    amount: number;
    category: Types.ObjectId;
    date: Date;
    description: string;
    paymentMethod: PaymentMethod;
    isRecurring: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    notes?: string;
    receiptUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Category document interface
 */
export interface ICategory extends Document {
    _id: Types.ObjectId;
    userId?: Types.ObjectId; // null for default categories
    name: string;
    color: string;
    icon: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Income document interface
 */
export interface IIncome extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    source: string;
    amount: number;
    date: Date;
    description?: string;
    isRecurring: boolean;
    recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Budget document interface
 */
export interface IBudget extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    month: number; // 1-12
    year: number;
    limit: number;
    categoryLimits: Array<{
        category: Types.ObjectId;
        limit: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Category-wise spending summary
 */
export interface CategorySpending {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
    percentage: number;
    count: number;
}

/**
 * Monthly summary data
 */
export interface MonthlySummary {
    month: number;
    year: number;
    totalExpenses: number;
    totalIncome: number;
    savings: number;
    savingsPercentage: number;
    budgetLimit: number;
    budgetUsed: number;
    budgetRemaining: number;
    isOverBudget: boolean;
    categoryBreakdown: CategorySpending[];
}

/**
 * Spending trend data point
 */
export interface TrendDataPoint {
    date: string;
    amount: number;
    label: string;
}
