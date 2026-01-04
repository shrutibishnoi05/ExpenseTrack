import mongoose, { Schema, Model } from 'mongoose';
import { IBudget } from '../types/models';

/**
 * Budget Schema
 * Monthly budget tracking with category-wise limits
 */
const budgetSchema = new Schema<IBudget>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        month: {
            type: Number,
            required: [true, 'Month is required'],
            min: [1, 'Month must be between 1 and 12'],
            max: [12, 'Month must be between 1 and 12'],
        },
        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: [2020, 'Year must be 2020 or later'],
            max: [2100, 'Year cannot exceed 2100'],
        },
        limit: {
            type: Number,
            required: [true, 'Budget limit is required'],
            min: [0, 'Budget limit cannot be negative'],
        },
        categoryLimits: [
            {
                category: {
                    type: Schema.Types.ObjectId,
                    ref: 'Category',
                    required: true,
                },
                limit: {
                    type: Number,
                    required: true,
                    min: [0, 'Category limit cannot be negative'],
                },
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                const { __v, ...rest } = ret;
                return rest;
            },
        },
    }
);

// Compound unique index: one budget per user per month/year
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const Budget: Model<IBudget> = mongoose.model<IBudget>('Budget', budgetSchema);

export default Budget;
