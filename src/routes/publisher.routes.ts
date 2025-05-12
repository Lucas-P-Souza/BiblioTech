import { Router } from 'express';
// Importa todas as funções do controller de editoras
import {
    getAllPublishers,
    getPublisherByName,
    getPublisherById,
    createPublisher,
    updatePublisherById,
    updatePublisherByName,
    deletePublisherById,
    deletePublisherByName,
    deleteAllPublishers
} from '../controllers/publisher.controller';

// Importa os middlewares de autenticação e autorização
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
// Importa o enum LibrarianRole para usar na autorização por role
import { LibrarianRole } from '@prisma/client';

const publisherRouter = Router();

// --- Rotas para /publishers ---

// Rotas PÚBLICAS: Listar e buscar editoras
publisherRouter.get('/', getAllPublishers); // Lista todas (com filtro opcional por nome)
publisherRouter.get('/by-name/:name', getPublisherByName); // Busca por nome
publisherRouter.get('/id/:id', getPublisherById); // Busca por ID

// Rota PRIVADA: Criar uma nova editora
publisherRouter.post('/', authenticateToken, createPublisher);

// Rotas PRIVADAS: Atualizar uma editora
publisherRouter.put('/id/:id', authenticateToken, updatePublisherById); // Atualiza por ID
publisherRouter.put('/by-name/:name', authenticateToken, updatePublisherByName); // Atualiza por nome

// Rotas PRIVADAS: Deletar uma editora
publisherRouter.delete('/id/:id', authenticateToken, deletePublisherById); // Deleta por ID
publisherRouter.delete('/by-name/:name', authenticateToken, deletePublisherByName); // Deleta por nome

// Rota PRIVADA e RESTRITA A ROLES: Deletar TODAS as editoras
publisherRouter.delete(
    '/', // Rota: DELETE /publishers
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager), // Apenas Admin ou Manager
    deleteAllPublishers
);

export default publisherRouter;
