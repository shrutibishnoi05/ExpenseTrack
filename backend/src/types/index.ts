import { Request } from 'express';
import { Document, Types } from 'mongoose';

/**
 * User role enumeration
 */
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

/**
 * User document interface
 */
export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    profilePicture?: string;
    currency: string;
    monthlyBudget: number;
    role: UserRole;
    isBlocked: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}

/**
 * Extended Express Request with user data
 */
export interface AuthRequest extends Request {
    user?: JwtPayload;
}

/**
 * API Response structure
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    pagination?: PaginationInfo;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Query parameters for list endpoints
 */
export interface QueryParams {
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
