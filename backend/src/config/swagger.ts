import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Expense Tracker API',
            version: '1.0.0',
            description: 'Production-ready REST API for Expense Tracking Application',
            contact: {
                name: 'API Support',
                email: 'support@expensetracker.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        currency: { type: 'string' },
                        monthlyBudget: { type: 'number' },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        profilePicture: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Expense: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        amount: { type: 'number' },
                        category: { $ref: '#/components/schemas/Category' },
                        date: { type: 'string', format: 'date' },
                        description: { type: 'string' },
                        paymentMethod: { type: 'string' },
                        isRecurring: { type: 'boolean' },
                        notes: { type: 'string' },
                        receiptUrl: { type: 'string' },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        color: { type: 'string' },
                        icon: { type: 'string' },
                        isDefault: { type: 'boolean' },
                    },
                },
                Income: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        source: { type: 'string' },
                        amount: { type: 'number' },
                        date: { type: 'string', format: 'date' },
                        isRecurring: { type: 'boolean' },
                    },
                },
                Budget: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        month: { type: 'integer' },
                        year: { type: 'integer' },
                        limit: { type: 'number' },
                        categoryLimits: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    category: { type: 'string' },
                                    limit: { type: 'number' },
                                },
                            },
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                    },
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User profile management' },
            { name: 'Expenses', description: 'Expense CRUD operations' },
            { name: 'Categories', description: 'Category management' },
            { name: 'Income', description: 'Income tracking' },
            { name: 'Budgets', description: 'Budget management' },
            { name: 'Analytics', description: 'Statistics and reports' },
            { name: 'Export', description: 'Export data to CSV/PDF' },
            { name: 'Admin', description: 'Admin-only endpoints' },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
