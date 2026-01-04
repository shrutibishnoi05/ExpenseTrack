import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError, BadRequest } from '../utils';

/**
 * Generic validation middleware factory
 * Validates request against a Zod schema
 */
export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format Zod errors into a readable message
                const errors = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                const message = errors.map((e) => `${e.field}: ${e.message}`).join(', ');
                next(BadRequest(message));
            } else {
                next(error);
            }
        }
    };
};

/**
 * Centralized error handling middleware
 * Processes all errors and returns consistent API responses
 */
export const errorHandler = (
    err: Error | ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Default error values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;

    // Handle known API errors
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    } else if (err.name === 'ValidationError') {
        // Mongoose validation error
        statusCode = 400;
        message = err.message;
        isOperational = true;
    } else if (err.name === 'CastError') {
        // Mongoose cast error (invalid ObjectId)
        statusCode = 400;
        message = 'Invalid ID format';
        isOperational = true;
    } else if ((err as NodeJS.ErrnoException).code === 'LIMIT_FILE_SIZE') {
        // Multer file size error
        statusCode = 400;
        message = 'File size too large';
        isOperational = true;
    } else if (err.name === 'MongoServerError' && (err as { code?: number }).code === 11000) {
        // MongoDB duplicate key error
        statusCode = 409;
        message = 'Duplicate entry. This record already exists.';
        isOperational = true;
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            statusCode,
        });
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: err.stack }),
    });
};

/**
 * Not found handler
 * Catches all unmatched routes
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
    next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};
