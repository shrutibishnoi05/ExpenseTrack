import { Response, NextFunction } from 'express';
import { User } from '../models';
import { AuthRequest } from '../types';
import { NotFound, BadRequest, Conflict } from '../utils';
import path from 'path';
import fs from 'fs';

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getProfile = async (
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
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, currency, monthlyBudget } = req.body;

        const user = await User.findById(req.user?.userId);
        if (!user) {
            throw NotFound('User not found');
        }

        // Update fields if provided
        if (name) user.name = name;
        if (currency) user.currency = currency;
        if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update email
 * PUT /api/users/email
 */
export const updateEmail = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findById(req.user?.userId).select('+password');
        if (!user) {
            throw NotFound('User not found');
        }

        // Verify current password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw BadRequest('Current password is incorrect');
        }

        // Check if new email is already in use
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            throw Conflict('Email is already in use');
        }

        user.email = email.toLowerCase();
        await user.save();

        res.json({
            success: true,
            message: 'Email updated successfully',
            data: { email: user.email },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change password
 * PUT /api/users/password
 */
export const changePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user?.userId).select('+password');
        if (!user) {
            throw NotFound('User not found');
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw BadRequest('Current password is incorrect');
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        user.refreshToken = undefined; // Invalidate all sessions
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload profile picture
 * POST /api/users/profile/picture
 */
export const uploadProfilePicture = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.file) {
            throw BadRequest('No file uploaded');
        }

        const user = await User.findById(req.user?.userId);
        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            throw NotFound('User not found');
        }

        // Delete old profile picture if exists
        if (user.profilePicture) {
            const oldPath = path.join(process.cwd(), user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update profile picture path
        user.profilePicture = `/${req.file.path.replace(/\\/g, '/')}`;
        await user.save();

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: { profilePicture: user.profilePicture },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete profile picture
 * DELETE /api/users/profile/picture
 */
export const deleteProfilePicture = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            throw NotFound('User not found');
        }

        // Delete profile picture file if exists
        if (user.profilePicture) {
            const picturePath = path.join(process.cwd(), user.profilePicture);
            if (fs.existsSync(picturePath)) {
                fs.unlinkSync(picturePath);
            }
        }

        user.profilePicture = '';
        await user.save();

        res.json({
            success: true,
            message: 'Profile picture deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
