export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FinPay API Specification',
    version: '1.0.0',
    description: 'Enterprise REST API Documentation for FinPay – Personal Finance & Digital Payments Platform',
    contact: {
      name: 'FinPay Engineering Team',
      email: 'api-support@finpay.local',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
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
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
          error: {
            type: 'object',
            nullable: true,
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alex.morgan@finpay.local' },
          password: { type: 'string', format: 'password', example: 'FintechSecure#2026' },
          firstName: { type: 'string', example: 'Alex' },
          lastName: { type: 'string', example: 'Morgan' },
          phoneNumber: { type: 'string', example: '+12025550143' },
          role: { type: 'string', enum: ['CUSTOMER', 'ADMIN', 'SUPPORT_AGENT'], default: 'CUSTOMER' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alex.morgan@finpay.local' },
          password: { type: 'string', format: 'password', example: 'FintechSecure#2026' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new customer or staff member',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully and default wallet created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
          '409': { description: 'User already exists' },
          '422': { description: 'Validation error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user and receive JWT tokens',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
          '401': { description: 'Invalid credentials' },
          '403': { description: 'Account locked or inactive' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get authenticated user profile and wallet overview',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
  },
};
