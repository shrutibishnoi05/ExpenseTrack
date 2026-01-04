import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { JwtPayload, UserRole } from '../types';

/**
 * Generate JWT access token (short-lived)
 * Used for authenticating API requests
 */
export const generateAccessToken = (payload: JwtPayload): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiry } as any);
};

/**
 * Generate JWT refresh token (long-lived)
 * Used for obtaining new access tokens
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiry } as any);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (
    userId: string,
    email: string,
    role: UserRole
): { accessToken: string; refreshToken: string } => {
    const payload: JwtPayload = { userId, email, role };
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    } catch {
        return null;
    }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    } catch {
        return null;
    }
};

/**
 * Generate password reset token
 * Creates a secure random token for password reset
 */
export const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash reset token for storage
 * We store the hash instead of the plain token for security
 */
export const hashResetToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
