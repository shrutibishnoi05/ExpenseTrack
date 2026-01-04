import mongoose from 'mongoose';
import { config } from './index';

/**
 * Establishes connection to MongoDB database
 * Includes connection event handlers for monitoring
 */
export const connectDatabase = async (): Promise<void> => {
    try {
        // MongoDB connection options
        const options = {
            autoIndex: true, // Build indexes in development
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        await mongoose.connect(config.mongodbUri, options);
        console.log('✅ MongoDB connected successfully');

        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};
