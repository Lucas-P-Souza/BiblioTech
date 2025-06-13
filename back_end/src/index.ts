import express, { Request, Response } from 'express';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import authRouter from './routes/auth.routes';
import authorRouter from './routes/author.routes';
import categoryRouter from './routes/category.routes';
import publisherRouter from './routes/publisher.routes';
import bookRouter from './routes/book.routes';
import librarianRouter from './routes/librarian.routes';

import path from 'path';

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BiblioTech API',
            version: '1.0.0',
            description: 'API para gestão do sistema de biblioteca BiblioTech.',
            contact: {
                name: 'Lucas P. Souza',
                url: 'https://github.com/Lucas-P-Souza/BiblioTech',
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Servidor de Desenvolvimento Local',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: [
        path.resolve(__dirname, './models/swagger.schemas.ts'),
        path.resolve(__dirname, './routes/*.ts'),
    ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        persistAuthorization: true
    }
}));

app.get('/', (req: Request, res: Response) => {
    res.redirect('/api-docs');
});

app.use('/auth', authRouter);
app.use('/authors', authorRouter);
app.use('/categories', categoryRouter);
app.use('/publishers', publisherRouter);
app.use('/books', bookRouter);
app.use('/librarians', librarianRouter);

app.listen(PORT, () => {
    console.log(`🚀 Servidor BiblioTech decolou na porta ${PORT}`);
    console.log(`📘 Documentação da API disponível em http://localhost:${PORT}/api-docs`);
});

process.on('SIGINT', () => {
    console.log('\nSinal SIGINT recebido. Desligando elegantemente...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\nSinal SIGTERM recebido. Desligando elegantemente...');
    process.exit(0);
});
