import { Router } from 'express';
import {
  getAllAuthors,
  getAuthorById,
  getAuthorByName,
  createAuthor,
  updateAuthorById,
  updateAuthorByName,
  deleteAuthorByName,
  deleteAuthorById,
  deleteAllAuthors
} from '../controllers/author.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { LibrarianRole } from '@prisma/client';

const authorRouter = Router();

/**
 * @swagger
 * tags:
 * - name: Autores
 *   description: Operações para gerenciamento de autores.
 */

// All GET endpoints
/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Recupera uma lista de autores.
 *     tags: [Autores]
 *     description: >
 *       Retorna uma lista de todos os autores cadastrados. Permite filtragem opcional por nome (parcial e case-insensitive) através do query parameter `name`.
 *     parameters:
 *       - name: name
 *         in: query
 *         required: false
 *         description: Termo para filtrar autores pelo nome.
 *         schema:
 *           type: string
 *           example: "Machado"
 *     responses:
 *       '200':
 *         description: Lista de autores obtida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Author'
 *       '500':
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authorRouter.get('/', getAllAuthors);

/**
 * @swagger
 * /authors/id/{id}:
 *   get:
 *     summary: Recupera um autor por ID.
 *     tags: [Autores]
 *     description: Retorna os detalhes de um autor específico, identificado pelo seu ID (UUID).
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador único (UUID) do autor.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       '200':
 *         description: Autor encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       '404':
 *         description: Autor não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
authorRouter.get('/id/:id', getAuthorById);

/**
 * @swagger
 * /authors/by-name/{name}:
 *   get:
 *     summary: Recupera um autor por nome.
 *     tags: [Autores]
 *     description: Retorna os detalhes de um autor específico, identificado pelo seu nome.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Nome do autor. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "José Saramago"
 *     responses:
 *       '200':
 *         description: Autor encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       '404':
 *         description: Autor não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
authorRouter.get('/by-name/:name', getAuthorByName);

// All POST endpoints
/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Registra um novo autor.
 *     tags: [Autores]
 *     description: Adiciona um novo autor ao sistema. Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados do novo autor.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewAuthor'
 *     responses:
 *       '201':
 *         description: Autor registrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
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
 *           Conflito de dados (ex: autor com este nome já existe, se o nome for uma constraint única).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
authorRouter.post('/', authenticateToken, createAuthor);

// All PUT endpoints
/**
 * @swagger
 * /authors/id/{id}:
 *   put:
 *     summary: Atualiza um autor por ID.
 *     tags: [Autores]
 *     description: Modifica os dados de um autor existente, identificado pelo seu ID (UUID). Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID (UUID) do autor a ser atualizado.
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados do autor para atualização.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAuthor'
 *     responses:
 *       '200':
 *         description: Autor atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       '400':
 *         description: Dados de entrada inválidos.
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Autor não encontrado.
 *       '409':
 *         description: >
 *           Conflito de dados (ex: novo nome já existe).
 *       '500':
 *         description: Erro interno do servidor.
 */
authorRouter.put('/id/:id', authenticateToken, updateAuthorById);

/**
 * @swagger
 * /authors/by-name/{name}:
 *   put:
 *     summary: Atualiza um autor por nome.
 *     tags: [Autores]
 *     description: Modifica os dados de um autor existente, identificado pelo seu nome. Requer autenticação JWT e que o nome do autor seja único no sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Nome atual do autor a ser atualizado. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "Machado de Assis"
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os novos dados para o autor.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAuthor'
 *     responses:
 *       '200':
 *         description: Autor atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       '400':
 *         description: Dados de entrada inválidos.
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Autor não encontrado com o nome fornecido.
 *       '409':
 *         description: >
 *           Conflito de dados (ex: novo nome já existe).
 *       '500':
 *         description: Erro interno do servidor.
 */
authorRouter.put('/by-name/:name', authenticateToken, updateAuthorByName);

// All DELETE endpoints
/**
 * @swagger
 * /authors:
 *   delete:
 *     summary: Remove todos os autores.
 *     tags: [Autores]
 *     description: Exclui permanentemente todos os registros de autores do sistema. Operação perigosa. Requer autenticação JWT e um `role` de Admin ou Manager.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Todos os autores foram removidos com sucesso.
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
authorRouter.delete(
  '/',
  authenticateToken,
  authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
  deleteAllAuthors
);

/**
 * @swagger
 * /authors/id/{id}:
 *   delete:
 *     summary: Remove um autor por ID.
 *     tags: [Autores]
 *     description: Exclui um autor do sistema, identificado pelo seu ID (UUID). Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID (UUID) do autor a ser removido.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Autor removido com sucesso (sem conteúdo na resposta).
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Autor não encontrado.
 *       '409':
 *         description: >
 *           Conflito (ex: autor associado a livros, impedindo a exclusão).
 *       '500':
 *         description: Erro interno do servidor.
 */
authorRouter.delete('/id/:id', authenticateToken, deleteAuthorById);

/**
 * @swagger
 * /authors/by-name/{name}:
 *   delete:
 *     summary: Remove um autor por nome.
 *     tags: [Autores]
 *     description: Exclui um autor do sistema, identificado pelo nome. Requer autenticação JWT e que o nome do autor seja único no sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Nome do autor a ser removido. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "Clarice Lispector"
 *     responses:
 *       '204':
 *         description: Autor removido com sucesso (sem conteúdo na resposta).
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Autor não encontrado com o nome fornecido.
 *       '409':
 *         description: >
 *           Conflito (ex: autor associado a livros, impedindo a exclusão).
 *       '500':
 *         description: Erro interno do servidor.
 */
authorRouter.delete('/by-name/:name', authenticateToken, deleteAuthorByName);

export default authorRouter;
