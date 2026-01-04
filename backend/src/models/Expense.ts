import mongoose, { Schema, Model } from 'mongoose';
import { IExpense, PaymentMethod } from '../types/models';

/**
 * Expense Schema
 * Core model for tracking expenses with rich metadata
 */
const expenseSchema = new Schema<IExpense>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0'],
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
            default: Date.now,
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [2, 'Description must be at least 2 characters'],
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
            default: PaymentMethod.CASH,
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurringFrequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly'],
            required: function (this: IExpense) {
                return this.isRecurring;
            },
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        receiptUrl: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Compound indexes for common query patterns
expenseSchema.index({ userId: 1, date: -1 }); // User's expenses by date
expenseSchema.index({ userId: 1, category: 1 }); // User's expenses by category
expenseSchema.index({ userId: 1, date: -1, category: 1 }); // Combined filter
expenseSchema.index({ userId: 1, amount: 1 }); // For amount-based filtering

// Text index for search functionality
expenseSchema.index({ description: 'text', notes: 'text' });

const Expense: Model<IExpense> = mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;
