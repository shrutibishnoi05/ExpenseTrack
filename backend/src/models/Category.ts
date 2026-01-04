import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '../types/models';

/**
 * Category Schema
 * Handles expense categorization with color coding
 * Supports both default (system) and custom (user) categories
 */
const categorySchema = new Schema<ICategory>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null, // null for default categories
        },
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            minlength: [2, 'Category name must be at least 2 characters'],
            maxlength: [50, 'Category name cannot exceed 50 characters'],
        },
        color: {
            type: String,
            required: [true, 'Category color is required'],
            match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code'],
            default: '#3B82F6', // Default blue color
        },
        icon: {
            type: String,
            default: 'tag', // Default icon name
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
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

// Index for default category queries
categorySchema.index({ isDefault: 1 });

// Ensure unique category names per user (also creates an index)
categorySchema.index(
    { userId: 1, name: 1 },
    { unique: true, partialFilterExpression: { userId: { $ne: null } } }
);

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);

export default Category;

/**
 * Default categories to be seeded on first run
 */
export const defaultCategories = [
    { name: 'Food & Dining', color: '#EF4444', icon: 'utensils', isDefault: true },
    { name: 'Transportation', color: '#F59E0B', icon: 'car', isDefault: true },
    { name: 'Shopping', color: '#8B5CF6', icon: 'shopping-bag', isDefault: true },
    { name: 'Entertainment', color: '#EC4899', icon: 'film', isDefault: true },
    { name: 'Bills & Utilities', color: '#3B82F6', icon: 'file-text', isDefault: true },
    { name: 'Healthcare', color: '#10B981', icon: 'heart', isDefault: true },
    { name: 'Education', color: '#6366F1', icon: 'book', isDefault: true },
    { name: 'Travel', color: '#14B8A6', icon: 'plane', isDefault: true },
    { name: 'Rent', color: '#F97316', icon: 'home', isDefault: true },
    { name: 'Groceries', color: '#22C55E', icon: 'shopping-cart', isDefault: true },
    { name: 'Personal Care', color: '#A855F7', icon: 'user', isDefault: true },
    { name: 'Other', color: '#6B7280', icon: 'more-horizontal', isDefault: true },
];
