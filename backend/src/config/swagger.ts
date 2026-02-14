import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TalentMatch AI API',
            version: '1.0.0',
            description: 'API documentation for TalentMatch AI Backend',
            contact: {
                name: 'API Support',
                email: 'support@talentmatch.ai'
            }
        },
        servers: [
            {
                url: `http://localhost:${config.port}/api`,
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'] // Files containing annotations
};

export const swaggerSpec = swaggerJsdoc(options);
