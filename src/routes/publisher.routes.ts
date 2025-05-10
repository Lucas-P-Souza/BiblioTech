import { Router } from 'express';
import {
    getAllPublishers,
    createPublisher,
    getPublisherById,
    updatePublisherById, // Renomeei para clareza, já que temos updateByName
    deletePublisherById, // Renomeei para clareza
    deleteAllPublishers,
    updatePublisherByName,
    deletePublisherByName
} from '../controllers/publisher.controller';

const publisherRouter = Router();

// Rotas para /publishers

// GET /publishers -> Listar todas (com filtro opcional por nome)
publisherRouter.get('/', getAllPublishers);

// POST /publishers -> Criar nova editora
publisherRouter.post('/', createPublisher);

// GET /publishers/:id -> Buscar por ID
publisherRouter.get('/:id', getPublisherById);

// PUT /publishers/:id -> Atualizar por ID
publisherRouter.put('/:id', updatePublisherById);

// DELETE /publishers/:id -> Deletar por ID
publisherRouter.delete('/:id', deletePublisherById);

// DELETE /publishers -> Deletar TODAS as editoras
publisherRouter.delete('/', deleteAllPublishers);

// PUT /publishers/by-name/:name -> Atualizar por NOME
publisherRouter.put('/by-name/:name', updatePublisherByName);

// DELETE /publishers/by-name/:name -> Deletar por NOME
publisherRouter.delete('/by-name/:name', deletePublisherByName);

export default publisherRouter;