import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Application configuration object
 * All environment variables are validated and typed here
 */
export const config = {
    // Server settings
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),

    // MongoDB connection
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker',

    // JWT configuration
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },

    // CORS
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // File upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    uploadDir: process.env.UPLOAD_DIR || 'uploads',

    // Email settings
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.FROM_EMAIL || 'noreply@expensetracker.com',
    },
};
