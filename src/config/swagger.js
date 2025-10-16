const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Swagger/OpenAPI configuration for Portfolio Backend API
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Backend API',
      version: '1.0.0',
      description: `
        A comprehensive backend API for portfolio management built with Node.js, Express, and PostgreSQL.
        
        ## Features
        - JWT-based authentication and authorization
        - Complete portfolio management (profiles, projects, posts, skills, certificates)
        - Advanced dashboard analytics with PostgreSQL aggregations
        - Comprehensive data validation and error handling
        - RESTful API design with proper HTTP status codes
        - Real-time statistics and growth analytics
        
        ## Authentication
        Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## Error Handling
        All endpoints return consistent error responses with the following format:
        \`\`\`json
        {
          "success": false,
          "error": {
            "message": "Error description",
            "code": "ERROR_CODE"
          }
        }
        \`\`\`
      `,
      contact: {
        name: 'Portfolio API Support',
        email: 'support@portfolio-api.com',
        url: 'https://portfolio-api.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.portfolio.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication. Format: Bearer <token>'
        }
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error description'
                },
                code: {
                  type: 'string',
                  example: 'ERROR_CODE'
                }
              }
            }
          }
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Validation failed'
                },
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        example: 'email'
                      },
                      message: {
                        type: 'string',
                        example: 'Email is required'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        // Pagination schema
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              example: 1
            },
            totalPages: {
              type: 'integer',
              example: 5
            },
            totalItems: {
              type: 'integer',
              example: 50
            },
            itemsPerPage: {
              type: 'integer',
              example: 10
            },
            hasNextPage: {
              type: 'boolean',
              example: true
            },
            hasPrevPage: {
              type: 'boolean',
              example: false
            }
          }
        },
        // User and Auth schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT authentication token'
                },
                user: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  message: 'Authentication required',
                  code: 'UNAUTHORIZED'
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  message: 'Insufficient permissions',
                  code: 'FORBIDDEN'
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  message: 'Resource not found',
                  code: 'NOT_FOUND'
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  message: 'Internal server error',
                  code: 'INTERNAL_ERROR'
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Profiles',
        description: 'User profile management endpoints'
      },
      {
        name: 'About',
        description: 'About section management endpoints'
      },
      {
        name: 'Projects',
        description: 'Project portfolio management endpoints'
      },
      {
        name: 'Posts',
        description: 'Blog post management endpoints'
      },
      {
        name: 'Skills',
        description: 'Skills and expertise management endpoints'
      },
      {
        name: 'Certificates',
        description: 'Certification and achievement management endpoints'
      },
      {
        name: 'Dashboard',
        description: 'Analytics and dashboard data endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

// Generate OpenAPI specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Swagger UI configuration options
 */
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // Add custom headers or modify requests if needed
      return req;
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
  `,
  customSiteTitle: 'Portfolio API Documentation',
  customfavIcon: '/favicon.ico'
};

/**
 * Setup Swagger documentation middleware
 * @param {Object} app - Express application instance
 */
function setupSwagger(app) {
  // Serve swagger.json
  app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Redirect root docs path to api-docs
  app.get('/docs', (req, res) => {
    res.redirect('/api-docs');
  });

  console.log('📚 Swagger documentation available at:');
  console.log(`   - UI: ${process.env.API_BASE_URL || 'http://localhost:3000'}/api-docs`);
  console.log(`   - JSON: ${process.env.API_BASE_URL || 'http://localhost:3000'}/api-docs/swagger.json`);
}

/**
 * Generate OpenAPI specification file
 * @param {string} outputPath - Path to save the specification file
 */
function generateSpecFile(outputPath = './swagger.json') {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const specJson = JSON.stringify(swaggerSpec, null, 2);
    fs.writeFileSync(path.resolve(outputPath), specJson);
    console.log(`✅ OpenAPI specification saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Failed to generate specification file:', error.message);
  }
}

module.exports = {
  swaggerSpec,
  swaggerOptions,
  swaggerUiOptions,
  setupSwagger,
  generateSpecFile
};