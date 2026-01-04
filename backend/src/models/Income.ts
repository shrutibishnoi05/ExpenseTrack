import mongoose, { Schema, Model } from 'mongoose';
import { IIncome } from '../types/models';

/**
 * Income Schema
 * Tracks income sources for income vs expense comparison
 */
const incomeSchema = new Schema<IIncome>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        source: {
            type: String,
            required: [true, 'Income source is required'],
            trim: true,
            minlength: [2, 'Source must be at least 2 characters'],
            maxlength: [100, 'Source cannot exceed 100 characters'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
            default: Date.now,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurringFrequency: {
            type: String,
            enum: ['weekly', 'biweekly', 'monthly', 'yearly'],
            required: function (this: IIncome) {
                return this.isRecurring;
            },
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
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, source: 1 });

const Income: Model<IIncome> = mongoose.model<IIncome>('Income', incomeSchema);

export default Income;
