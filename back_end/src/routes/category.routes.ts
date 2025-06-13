import { Router } from 'express';
import {
    getAllCategories,
    getCategoryByName,
    createCategory,
    updateCategoryByName,
    deleteCategoryByName,
    deleteAllCategories
} from '../controllers/category.controller';

import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { LibrarianRole } from '@prisma/client';

const categoryRouter = Router();

/**
 * @swagger
 * tags:
 * - name: Categorias
 *   description: Operações para gerenciamento de categorias de livros.
 */

// All GET endpoints
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Recupera uma lista de categorias.
 *     tags: [Categorias]
 *     description: >
 *       Retorna uma lista de todas as categorias cadastradas. Permite filtragem opcional por nome (parcial e case-insensitive) através do query parameter `name`.
 *     parameters:
 *       - name: name
 *         in: query
 *         required: false
 *         description: Termo para filtrar categorias pelo nome.
 *         schema:
 *           type: string
 *           example: "Ficção"
 *     responses:
 *       '200':
 *         description: Lista de categorias obtida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       '500':
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
categoryRouter.get('/', getAllCategories);

/**
 * @swagger
 * /categories/by-name/{name}:
 *   get:
 *     summary: Recupera uma categoria por nome.
 *     tags: [Categorias]
 *     description: Retorna os detalhes de uma categoria específica, identificada pelo seu nome.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Nome da categoria. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "Ficção Científica"
 *     responses:
 *       '200':
 *         description: Categoria encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '404':
 *         description: Categoria não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
categoryRouter.get('/by-name/:name', getCategoryByName);

// All POST endpoints
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Registra uma nova categoria.
 *     tags: [Categorias]
 *     description: Adiciona uma nova categoria ao sistema. Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados da nova categoria.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewCategory'
 *     responses:
 *       '201':
 *         description: Categoria registrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
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
 *           Conflito de dados (ex: categoria com este nome já existe).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
categoryRouter.post('/', authenticateToken, createCategory);

// All PUT endpoints
/**
 * @swagger
 * /categories/by-name/{name}:
 *   put:
 *     summary: Atualiza uma categoria por nome.
 *     tags: [Categorias]
 *     description: Modifica os dados de uma categoria existente, identificada pelo seu nome. Requer autenticação JWT e que o nome da categoria seja único no sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Nome atual da categoria a ser atualizada. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "Ficção Científica"
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os novos dados para a categoria.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategory'
 *     responses:
 *       '200':
 *         description: Categoria atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '400':
 *         description: Dados de entrada inválidos.
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Categoria não encontrada com o nome fornecido.
 *       '409':
 *         description: >
 *           Conflito de dados (ex: novo nome já existe).
 *       '500':
 *         description: Erro interno do servidor.
 */
categoryRouter.put('/by-name/:name', authenticateToken, updateCategoryByName);

// All DELETE endpoints
/**
 * @swagger
 * /categories:
 *   delete:
 *     summary: Remove todas as categorias.
 *     tags: [Categorias]
 *     description: Exclui permanentemente todos os registros de categorias do sistema. Operação perigosa. Requer autenticação JWT e um `role` de Admin ou Manager.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Todas as categorias foram removidas com sucesso.
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
categoryRouter.delete(
    '/',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    deleteAllCategories
);

/**
 * @swagger
 * /categories/by-name/{name}:
 *   delete:
 *     summary: Remove uma categoria por nome.
 *     tags: [Categorias]
 *     description: Exclui uma categoria do sistema, identificada pelo nome. Requer autenticação JWT e que o nome da categoria seja único no sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: Nome da categoria a ser removida. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "Literatura Clássica"
 *     responses:
 *       '204':
 *         description: Categoria removida com sucesso (sem conteúdo na resposta).
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Categoria não encontrada com o nome fornecido.
 *       '409':
 *         description: >
 *           Conflito (ex: categoria associada a livros, impedindo a exclusão).
 *       '500':
 *         description: Erro interno do servidor.
 */
categoryRouter.delete('/by-name/:name', authenticateToken, deleteCategoryByName);

// Se você decidir adicionar rotas por ID (UUID) para Categoria no futuro, elas seriam adicionadas aqui.

export default categoryRouter;
