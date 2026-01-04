import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User, Category, defaultCategories } from '../models';
import { AuthRequest, UserRole } from '../types';
import {
    generateTokenPair,
    verifyRefreshToken,
    generateResetToken,
    hashResetToken,
    BadRequest,
    Unauthorized,
    NotFound,
    Conflict,
} from '../utils';

/**
 * Sign up new user
 * POST /api/auth/signup
 */
export const signup = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw Conflict('Email is already registered');
        }

        // Create new user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
        });

        // Seed default categories for this user
        const userCategories = defaultCategories.map((cat) => ({
            ...cat,
            userId: null, // Default categories are shared
        }));

        // Check if default categories exist, if not create them
        const existingDefaults = await Category.countDocuments({ isDefault: true });
        if (existingDefaults === 0) {
            await Category.insertMany(userCategories);
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokenPair(
            user._id.toString(),
            user.email,
            user.role as UserRole
        );

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    currency: user.currency,
                    monthlyBudget: user.monthlyBudget,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user with password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            throw Unauthorized('Invalid email or password');
        }

        // Check if user is blocked
        if (user.isBlocked) {
            throw Unauthorized('Your account has been blocked. Contact support.');
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw Unauthorized('Invalid email or password');
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokenPair(
            user._id.toString(),
            user.email,
            user.role as UserRole
        );

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    currency: user.currency,
                    monthlyBudget: user.monthlyBudget,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.user) {
            // Clear refresh token
            await User.findByIdAndUpdate(req.user.userId, { refreshToken: null });
        }

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            throw BadRequest('Refresh token is required');
        }

        // Verify refresh token
        const payload = verifyRefreshToken(token);
        if (!payload) {
            throw Unauthorized('Invalid or expired refresh token');
        }

        // Find user and verify stored refresh token
        const user = await User.findById(payload.userId).select('+refreshToken');
        if (!user || user.refreshToken !== token) {
            throw Unauthorized('Invalid refresh token');
        }

        if (user.isBlocked) {
            throw Unauthorized('Your account has been blocked');
        }

        // Generate new token pair
        const tokens = generateTokenPair(user._id.toString(), user.email, user.role as UserRole);

        // Update stored refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.json({
            success: true,
            message: 'Tokens refreshed successfully',
            data: tokens,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Forgot password - send reset link
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Return success even if user not found (security best practice)
            res.json({
                success: true,
                message: 'If your email is registered, you will receive a password reset link',
            });
            return;
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const hashedToken = hashResetToken(resetToken);

        // Save hashed token and expiry (1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        // In production, send email with reset link
        // For now, return the token in response (only in development)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // TODO: Send email with resetUrl in production
        console.log('Password reset URL:', resetUrl);

        res.json({
            success: true,
            message: 'If your email is registered, you will receive a password reset link',
            // Only in development - remove in production
            ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl }),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { token, password } = req.body;

        // Hash the provided token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            throw BadRequest('Invalid or expired reset token');
        }

        // Update password and clear reset token
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.refreshToken = undefined; // Invalidate all sessions
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully. Please login with your new password.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            throw NotFound('User not found');
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    currency: user.currency,
                    monthlyBudget: user.monthlyBudget,
                    role: user.role,
                    createdAt: user.createdAt,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};
