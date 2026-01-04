// User types
export interface User {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    currency: string;
    monthlyBudget: number;
    role: 'user' | 'admin';
    createdAt: string;
}

// Auth types
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
}

// Category types
export interface Category {
    _id: string;
    name: string;
    color: string;
    icon: string;
    isDefault: boolean;
    userId?: string;
}

// Expense types
export interface Expense {
    _id: string;
    userId: string;
    amount: number;
    category: Category;
    date: string;
    description: string;
    paymentMethod: PaymentMethod;
    isRecurring: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    notes?: string;
    receiptUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export type PaymentMethod =
    | 'cash'
    | 'credit_card'
    | 'debit_card'
    | 'upi'
    | 'net_banking'
    | 'wallet'
    | 'other';

export interface ExpenseFormData {
    amount: number;
    category: string;
    date: string;
    description: string;
    paymentMethod?: PaymentMethod;
    isRecurring?: boolean;
    recurringFrequency?: string;
    notes?: string;
}

// Income types
export interface Income {
    _id: string;
    userId: string;
    source: string;
    amount: number;
    date: string;
    description?: string;
    isRecurring: boolean;
    recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    createdAt: string;
    updatedAt: string;
}

export interface IncomeFormData {
    source: string;
    amount: number;
    date: string;
    description?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
}

// Budget types
export interface Budget {
    _id: string;
    userId: string;
    month: number;
    year: number;
    limit: number;
    categoryLimits: Array<{
        category: Category | string;
        limit: number;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface BudgetFormData {
    month: number;
    year: number;
    limit: number;
    categoryLimits?: Array<{
        category: string;
        limit: number;
    }>;
}

// Analytics types
export interface DashboardSummary {
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

export interface CategorySpending {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
    percentage: number;
    count: number;
}

export interface TrendDataPoint {
    date: string;
    amount: number;
    label: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// Query params
export interface ExpenseQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
    category?: string;
    search?: string;
    minAmount?: number;
    maxAmount?: number;
}
