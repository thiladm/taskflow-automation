const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TaskFlow API',
            version: '1.0.0',
            description: 'TaskFlow application API with user authentication, list management, and task operations',
            contact: {
                name: 'API Support',
                email: 'support@taskflow.com'
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://taskflow-smiw.onrender.com/api'
                    : 'http://localhost:4000/api',
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from login'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        username: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 30,
                            description: 'Unique username'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            description: 'User password (hashed when stored)'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Account creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                List: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'List ID'
                        },
                        title: {
                            type: 'string',
                            maxLength: 100,
                            description: 'List title'
                        },
                        description: {
                            type: 'string',
                            maxLength: 500,
                            description: 'Optional list description'
                        },
                        color: {
                            type: 'string',
                            default: '#007bff',
                            description: 'Hex color code for the list'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'ID of the user who owns this list'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'List creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                Task: {
                    type: 'object',
                    required: ['title', 'list_id'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Task ID'
                        },
                        title: {
                            type: 'string',
                            maxLength: 200,
                            description: 'Task title'
                        },
                        description: {
                            type: 'string',
                            maxLength: 1000,
                            description: 'Optional task description'
                        },
                        completed: {
                            type: 'boolean',
                            default: false,
                            description: 'Task completion status'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high'],
                            default: 'medium',
                            description: 'Task priority level'
                        },
                        due_date: {
                            type: 'string',
                            format: 'date',
                            description: 'Optional due date for the task'
                        },
                        list_id: {
                            type: 'integer',
                            description: 'ID of the list this task belongs to'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'ID of the user who owns this task'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Task creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Response message'
                        },
                        token: {
                            type: 'string',
                            description: 'JWT authentication token'
                        },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                username: { type: 'string' },
                                email: { type: 'string' }
                            }
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    msg: { type: 'string' },
                                    param: { type: 'string' },
                                    location: { type: 'string' }
                                }
                            },
                            description: 'Validation errors array'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = specs;
