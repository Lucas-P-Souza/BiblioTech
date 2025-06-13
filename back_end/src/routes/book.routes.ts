import { Router } from 'express';
import {
    createBook,
    getAllBooks,
    getBookById,
    getBooksByExactTitle,
    updateBookById,
    updateBookByIsbn,
    deleteBookById,
    deleteBookByIsbn,
    deleteAllBooks
} from '../controllers/book.controller';

import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { LibrarianRole } from '@prisma/client';

const bookRouter = Router();

/**
 * @swagger
 * tags:
 * - name: Livros
 *   description: Operações para gerenciamento de livros.
 */

// All GET endpoints
/**
 * @swagger
 * /books:
 *   get:
 *     summary: Recupera uma lista de livros.
 *     tags: [Livros]
 *     description: >
 *       Retorna uma lista de todos os livros cadastrados. Permite filtragem opcional por título, autor, 
 *       categoria e disponibilidade.
 *     parameters:
 *       - name: title
 *         in: query
 *         required: false
 *         description: Termo para filtrar livros pelo título.
 *         schema:
 *           type: string
 *           example: "Dom Casmurro"
 *       - name: author
 *         in: query
 *         required: false
 *         description: Nome do autor para filtrar livros.
 *         schema:
 *           type: string
 *           example: "Machado de Assis"
 *       - name: category
 *         in: query
 *         required: false
 *         description: Nome da categoria para filtrar livros.
 *         schema:
 *           type: string
 *           example: "Literatura Brasileira"
 *       - name: available
 *         in: query
 *         required: false
 *         description: Filtrar por disponibilidade (true/false).
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       '200':
 *         description: Lista de livros obtida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       '500':
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
bookRouter.get('/', getAllBooks);

/**
 * @swagger
 * /books/id/{id}:
 *   get:
 *     summary: Recupera um livro por ID.
 *     tags: [Livros]
 *     description: Retorna os detalhes de um livro específico, identificado pelo seu ID (UUID).
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador único (UUID) do livro.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       '200':
 *         description: Livro encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       '404':
 *         description: Livro não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
bookRouter.get('/id/:id', getBookById);

/**
 * @swagger
 * /books/title/{title}:
 *   get:
 *     summary: Recupera livros por título exato.
 *     tags: [Livros]
 *     description: Retorna uma lista de livros que correspondem exatamente ao título fornecido.
 *     parameters:
 *       - name: title
 *         in: path
 *         required: true
 *         description: Título exato do livro. Deve ser URL-encoded se contiver espaços ou caracteres especiais.
 *         schema:
 *           type: string
 *           example: "Dom Casmurro"
 *     responses:
 *       '200':
 *         description: Lista de livros encontrados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       '500':
 *         description: Erro interno do servidor.
 */
bookRouter.get('/title/:title', getBooksByExactTitle);

// All POST endpoints
/**
 * @swagger
 * /books:
 *   post:
 *     summary: Registra um novo livro.
 *     tags: [Livros]
 *     description: Adiciona um novo livro ao sistema. Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados do novo livro.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBook'
 *     responses:
 *       '201':
 *         description: Livro registrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       '400':
 *         description: >
 *           Dados de entrada inválidos (ex: título ou ISBN não fornecido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Autenticação falhou (token JWT ausente, inválido ou expirado).
 *       '409':
 *         description: >
 *           Conflito de dados (ex: livro com este ISBN já existe).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
bookRouter.post('/', authenticateToken, createBook);

// All PUT endpoints
/**
 * @swagger
 * /books/id/{id}:
 *   put:
 *     summary: Atualiza um livro por ID.
 *     tags: [Livros]
 *     description: Modifica os dados de um livro existente, identificado pelo seu ID (UUID). Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID (UUID) do livro a ser atualizado.
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados do livro para atualização.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBook'
 *     responses:
 *       '200':
 *         description: Livro atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       '400':
 *         description: Dados de entrada inválidos.
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Livro não encontrado.
 *       '409':
 *         description: >
 *           Conflito de dados (ex: novo ISBN já existe).
 *       '500':
 *         description: Erro interno do servidor.
 */
bookRouter.put('/id/:id', authenticateToken, updateBookById);

/**
 * @swagger
 * /books/isbn/{isbn}:
 *   put:
 *     summary: Atualiza um livro por ISBN.
 *     tags: [Livros]
 *     description: Modifica os dados de um livro existente, identificado pelo seu ISBN. Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: isbn
 *         in: path
 *         required: true
 *         description: ISBN do livro a ser atualizado.
 *         schema:
 *           type: string
 *           example: "9788535902778"
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados do livro para atualização.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBook'
 *     responses:
 *       '200':
 *         description: Livro atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       '400':
 *         description: Dados de entrada inválidos.
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Livro não encontrado com o ISBN fornecido.
 *       '409':
 *         description: >
 *           Conflito de dados (ex: novo ISBN já existe).
 *       '500':
 *         description: Erro interno do servidor.
 */
bookRouter.put('/isbn/:isbn', authenticateToken, updateBookByIsbn);

// All DELETE endpoints
/**
 * @swagger
 * /books:
 *   delete:
 *     summary: Remove todos os livros.
 *     tags: [Livros]
 *     description: Exclui permanentemente todos os registros de livros do sistema. Operação perigosa. Requer autenticação JWT e um `role` de Admin ou Manager.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Todos os livros foram removidos com sucesso.
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
bookRouter.delete(
    '/',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    deleteAllBooks
);

/**
 * @swagger
 * /books/id/{id}:
 *   delete:
 *     summary: Remove um livro por ID.
 *     tags: [Livros]
 *     description: Exclui um livro do sistema, identificado pelo seu ID (UUID). Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID (UUID) do livro a ser removido.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Livro removido com sucesso (sem conteúdo na resposta).
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Livro não encontrado.
 *       '409':
 *         description: >
 *           Conflito (ex: livro está emprestado ou reservado).
 *       '500':
 *         description: Erro interno do servidor.
 */
bookRouter.delete('/id/:id', authenticateToken, deleteBookById);

/**
 * @swagger
 * /books/isbn/{isbn}:
 *   delete:
 *     summary: Remove um livro por ISBN.
 *     tags: [Livros]
 *     description: Exclui um livro do sistema, identificado pelo ISBN. Requer autenticação JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: isbn
 *         in: path
 *         required: true
 *         description: ISBN do livro a ser removido.
 *         schema:
 *           type: string
 *           example: "9788535902778"
 *     responses:
 *       '204':
 *         description: Livro removido com sucesso (sem conteúdo na resposta).
 *       '401':
 *         description: Autenticação falhou.
 *       '404':
 *         description: Livro não encontrado com o ISBN fornecido.
 *       '409':
 *         description: >
 *           Conflito (ex: livro está emprestado ou reservado).
 *       '500':
 *         description: Erro interno do servidor.
 */
bookRouter.delete('/isbn/:isbn', authenticateToken, deleteBookByIsbn);

export default bookRouter;
