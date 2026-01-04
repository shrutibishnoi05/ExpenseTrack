import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

import { config } from './config';
import { connectDatabase } from './config/database';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware';
import { Category, defaultCategories } from './models';

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
    const app = express();

    // Security middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to be served
    }));

    // CORS configuration
    app.use(
        cors({
            origin: config.frontendUrl,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
    );

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), config.uploadDir);
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Serve static files (uploads)
    app.use('/uploads', express.static(uploadsDir));

    // API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Expense Tracker API Docs',
    }));

    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
        res.json({
            success: true,
            message: 'Expense Tracker API is running',
            timestamp: new Date().toISOString(),
            environment: config.nodeEnv,
        });
    });

    // API routes
    app.use('/api', routes);

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

/**
 * Seed default categories if they don't exist
 */
const seedDefaultCategories = async (): Promise<void> => {
    try {
        const existingDefaults = await Category.countDocuments({ isDefault: true });
        if (existingDefaults === 0) {
            await Category.insertMany(defaultCategories);
            console.log('✅ Default categories seeded');
        }
    } catch (error) {
        console.error('Error seeding default categories:', error);
    }
};

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
    try {
        // Connect to database
        await connectDatabase();

        // Seed default data
        await seedDefaultCategories();

        // Create and start app
        const app = createApp();

        app.listen(config.port, () => {
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log('║           EXPENSE TRACKER API SERVER STARTED               ║');
            console.log('╠════════════════════════════════════════════════════════════╣');
            console.log(`║  🚀 Server:     http://localhost:${config.port}                    ║`);
            console.log(`║  📚 API Docs:   http://localhost:${config.port}/api-docs             ║`);
            console.log(`║  🌍 Environment: ${config.nodeEnv.padEnd(40)}║`);
            console.log('╚════════════════════════════════════════════════════════════╝');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the application
startServer();
