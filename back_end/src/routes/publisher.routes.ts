import { Router } from 'express';
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

import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { LibrarianRole } from '@prisma/client';

const publisherRouter = Router();

/**
 * @swagger
 * tags:
 * - name: Editoras
 *   description: Operações para gerenciamento de editoras.
 */

// All GET endpoints
/**
 * @swagger
 * /publishers:
 *   get:
 *     summary: Recupera uma lista de editoras.
 *     tags: [Editoras]
 *     description: >
 *       Retorna uma lista de todas as editoras cadastradas. Permite filtragem opcional por nome (parcial e case-insensitive) através do query parameter `name`.
 *     parameters:
 *       - name: name
 *         in: query
 *         required: false
 *         description: Termo para filtrar editoras pelo nome.
 *         schema:
 *           type: string
 *           example: "Companhia"
 *     responses:
 *       '200':
 *         description: Lista de editoras obtida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Publisher'
 *       '500':
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
publisherRouter.get('/', getAllPublishers);

/**
 * @swagger
 * /publishers/by-name/{name}:
 *   get:
 *     summary: Recupera uma editora por nome.
 *     tags: [Editoras]
 *     description: Retorna os detalhes de uma editora específica, identificada pelo seu nome.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Nome da editora. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "Companhia das Letras"
 *     responses:
 *       '200':
 *         description: Editora encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publisher'
 *       '404':
 *         description: Editora não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
publisherRouter.get('/by-name/:name', getPublisherByName);

/**
 * @swagger
 * /publishers/id/{id}:
 *   get:
 *     summary: Recupera uma editora por ID.
 *     tags: [Editoras]
 *     description: Retorna os detalhes de uma editora específica, identificada pelo seu ID (UUID).
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador único (UUID) da editora.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       '200':
 *         description: Editora encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publisher'
 *       '404':
 *         description: Editora não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
publisherRouter.get('/id/:id', getPublisherById);

// All POST endpoints
/**
 * @swagger
 * /publishers:
 *   post:
 *     summary: Registra uma nova editora.
 *     tags: [Editoras]
 *     description: Adiciona uma nova editora ao sistema. Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados da nova editora.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewPublisher'
 *     responses:
 *       '201':
 *         description: Editora registrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publisher'
 *       '400':
 *         description: >
 *           Dados de entrada inválidos (ex: nome não fornecido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Autenticação falhou (token JWT ausente, inválido ou expirado).
 *       '409':
 *         description: >
 *           Conflito de dados (ex: editora com este nome já existe).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
publisherRouter.post('/', authenticateToken, createPublisher);

// All PUT endpoints
/**
 * @swagger
 * /publishers/id/{id}:
 *   put:
 *     summary: Atualiza uma editora por ID.
 *     tags: [Editoras]
 *     description: Modifica os dados de uma editora existente, identificada pelo seu ID (UUID). Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID (UUID) da editora a ser atualizada.
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados da editora para atualização.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePublisher'
 *     responses:
 *       '200':
 *         description: Editora atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publisher'
 *       '400':
 *         description: Dados de entrada inválidos.
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Editora não encontrada.
 *       '409':
 *         description: >
 *           Conflito de dados (ex: novo nome já existe).
 *       '500':
 *         description: Erro interno do servidor.
 */
publisherRouter.put('/id/:id', authenticateToken, updatePublisherById);

/**
 * @swagger
 * /publishers/by-name/{name}:
 *   put:
 *     summary: Atualiza uma editora por nome.
 *     tags: [Editoras]
 *     description: Modifica os dados de uma editora existente, identificada pelo seu nome. Requer autenticação JWT e que o nome da editora seja único no sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Nome atual da editora a ser atualizada. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "Companhia das Letras"
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os novos dados para a editora.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePublisher'
 *     responses:
 *       '200':
 *         description: Editora atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publisher'
 *       '400':
 *         description: Dados de entrada inválidos.
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Editora não encontrada com o nome fornecido.
 *       '409':
 *         description: >
 *           Conflito de dados (ex: novo nome já existe).
 *       '500':
 *         description: Erro interno do servidor.
 */
publisherRouter.put('/by-name/:name', authenticateToken, updatePublisherByName);

// All DELETE endpoints
/**
 * @swagger
 * /publishers:
 *   delete:
 *     summary: Remove todas as editoras.
 *     tags: [Editoras]
 *     description: Exclui permanentemente todos os registros de editoras do sistema. Operação perigosa. Requer autenticação JWT e um `role` de Admin ou Manager.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Todas as editoras foram removidas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteAllResult'
 *       '401':
 *         description: Autenticação falhou.
 *       '403':
 *         description: Acesso proibido (role do usuário não tem permissão).
 *       '500':
 *         description: Erro interno do servidor.
 */
publisherRouter.delete(
    '/',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    deleteAllPublishers
);

/**
 * @swagger
 * /publishers/id/{id}:
 *   delete:
 *     summary: Remove uma editora por ID.
 *     tags: [Editoras]
 *     description: Exclui uma editora do sistema, identificada pelo seu ID (UUID). Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID (UUID) da editora a ser removida.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Editora removida com sucesso (sem conteúdo na resposta).
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Editora não encontrada.
 *       '409':
 *         description: >
 *           Conflito (ex: editora associada a livros, impedindo a exclusão).
 *       '500':
 *         description: Erro interno do servidor.
 */
publisherRouter.delete('/id/:id', authenticateToken, deletePublisherById);

/**
 * @swagger
 * /publishers/by-name/{name}:
 *   delete:
 *     summary: Remove uma editora por nome.
 *     tags: [Editoras]
 *     description: Exclui uma editora do sistema, identificada pelo nome. Requer autenticação JWT e que o nome da editora seja único no sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Nome da editora a ser removida. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "Editora Abril"
 *     responses:
 *       '204':
 *         description: Editora removida com sucesso (sem conteúdo na resposta).
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Editora não encontrada com o nome fornecido.
 *       '409':
 *         description: >
 *           Conflito (ex: editora associada a livros, impedindo a exclusão).
 *       '500':
 *         description: Erro interno do servidor.
 */
publisherRouter.delete('/by-name/:name', authenticateToken, deletePublisherByName);

export default publisherRouter;
