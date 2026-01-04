/**
 * Custom API Error class with status codes
 */
export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Pre-defined error factory methods
 */
export const BadRequest = (message = 'Bad Request') => new ApiError(400, message);
export const Unauthorized = (message = 'Unauthorized') => new ApiError(401, message);
export const Forbidden = (message = 'Forbidden') => new ApiError(403, message);
export const NotFound = (message = 'Not Found') => new ApiError(404, message);
export const Conflict = (message = 'Conflict') => new ApiError(409, message);
export const UnprocessableEntity = (message = 'Unprocessable Entity') => new ApiError(422, message);
export const TooManyRequests = (message = 'Too Many Requests') => new ApiError(429, message);
export const InternalError = (message = 'Internal Server Error') =>
    new ApiError(500, message, false);
