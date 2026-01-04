import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { verifyAccessToken, Unauthorized, Forbidden } from '../utils';
import { User } from '../models';

/**
 * Authentication middleware
 * Validates JWT access token and attaches user to request
 */
export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw Unauthorized('Access token is required');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw Unauthorized('Access token is required');
        }

        // Verify token
        const payload = verifyAccessToken(token);
        if (!payload) {
            throw Unauthorized('Invalid or expired access token');
        }

        // Check if user still exists and is not blocked
        const user = await User.findById(payload.userId).select('isBlocked role');
        if (!user) {
            throw Unauthorized('User no longer exists');
        }

        if (user.isBlocked) {
            throw Forbidden('Your account has been blocked');
        }

        // Attach user info to request
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: user.role as UserRole,
        };

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Admin authorization middleware
 * Requires user to have admin role
 */
export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        return next(Unauthorized('Authentication required'));
    }

    if (req.user.role !== UserRole.ADMIN) {
        return next(Forbidden('Admin access required'));
    }

    next();
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return next();
        }

        const payload = verifyAccessToken(token);
        if (payload) {
            req.user = payload;
        }

        next();
    } catch {
        // Silently continue without auth
        next();
    }
};
