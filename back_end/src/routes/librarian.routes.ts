import { Router } from 'express';
import {
    createLibrarian,
    getAllLibrarians,
    getLibrarianById,
    updateLibrarianById,
    deleteLibrarianById,
    deleteAllLibrarians,
    getLibrarianByEmployeeId,
    updateLibrarianByEmployeeId,
    deleteLibrarianByEmployeeId
} from '../controllers/librarian.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { checkIfFirstAdmin } from '../middlewares/librarian.middleware';
import { LibrarianRole } from '@prisma/client';

const librarianRouter = Router();

/**
 * @swagger
 * tags:
 * - name: Bibliotecários
 *   description: Operações para gerenciamento de bibliotecários.
 */

// All POST endpoints
/**
 * @swagger
 * /librarians:
 *   post:
 *     summary: Registra um novo bibliotecário.
 *     tags: [Bibliotecários]
 *     description: >
 *       Adiciona um novo bibliotecário ao sistema. Se for o primeiro bibliotecário,
 *       não requer autenticação e será automaticamente um Admin. Caso contrário,
 *       requer autenticação JWT e role de Admin.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados do novo bibliotecário.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewLibrarian'
 *     responses:
 *       '201':
 *         description: Bibliotecário registrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Librarian'
 *       '400':
 *         description: >
 *           Dados de entrada inválidos (ex: campos obrigatórios não fornecidos).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Autenticação falhou (token JWT ausente, inválido ou expirado).
 *       '403':
 *         description: Permissão negada (role inadequado).
 *       '409':
 *         description: >
 *           Conflito de dados (ex: email ou employeeId já existem).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno do servidor.
 */
librarianRouter.post('/', checkIfFirstAdmin, createLibrarian);

// All GET endpoints
/**
 * @swagger
 * /librarians:
 *   get:
 *     summary: Recupera uma lista de bibliotecários.
 *     tags: [Bibliotecários]
 *     description: >
 *       Retorna uma lista de todos os bibliotecários cadastrados. 
 *       Requer autenticação JWT e role de Admin ou Manager.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de bibliotecários obtida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Librarian'
 *       '401':
 *         description: Autenticação falhou.
 *       '403':
 *         description: Permissão negada (role inadequado).
 *       '500':
 *         description: Erro interno do servidor.
 */
librarianRouter.get(
    '/',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    getAllLibrarians
);

/**
 * @swagger
 * /librarians/id/{id}:
 *   get:
 *     summary: Recupera um bibliotecário por ID.
 *     tags: [Bibliotecários]
 *     description: >
 *       Retorna os detalhes de um bibliotecário específico, identificado pelo seu ID (UUID).
 *       Requer autenticação JWT e role de Admin ou Manager.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador único (UUID) do bibliotecário.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       '200':
 *         description: Bibliotecário encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Librarian'
 *       '401':
 *         description: Autenticação falhou.
 *       '403':
 *         description: Permissão negada (role inadequado).
 *       '404':
 *         description: Bibliotecário não encontrado.
 *       '500':
 *         description: Erro interno do servidor.
 */
librarianRouter.get(
    '/id/:id',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    getLibrarianById
);

/**
 * @swagger
 * /librarians/employee/{employeeId}:
 *   get:
 *     summary: Recupera um bibliotecário por número de funcionário.
 *     tags: [Bibliotecários]
 *     description: >
 *       Retorna os detalhes de um bibliotecário específico, identificado pelo seu número de funcionário.
 *       Requer autenticação JWT e role de Admin ou Manager.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: Número de identificação do funcionário.
 *         schema:
 *           type: string
 *           example: "EMP12345"
 *     responses:
 *       '200':
 *         description: Bibliotecário encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Librarian'
 *       '401':
 *         description: Autenticação falhou.
 *       '403':
 *         description: Permissão negada (role inadequado).
 *       '404':
 *         description: Bibliotecário não encontrado.
 *       '500':
 *         description: Erro interno do servidor.
 */
librarianRouter.get(
    '/employee/:employeeId',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    getLibrarianByEmployeeId
);

// All PUT endpoints
/**
 * @swagger
 * /librarians/id/{id}:
 *   put:
 *     summary: Atualiza um bibliotecário por ID.
 *     tags: [Bibliotecários]
 *     description: >
 *       Modifica os dados de um bibliotecário existente, identificado pelo seu ID (UUID).
 *       Requer autenticação JWT e role de Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID (UUID) do bibliotecário a ser atualizado.
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados do bibliotecário para atualização.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLibrarian'
 *     responses:
 *       '200':
 *         description: Bibliotecário atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Librarian'
 *       '400':
 *         description: Dados de entrada inválidos.
 *       '401':
 *         description: Autenticação falhou.
 *       '403':
 *         description: Permissão negada (role inadequado).
 *       '404':
 *         description: Bibliotecário não encontrado.
 *       '409':
 *         description: >
 *           Conflito de dados (ex: novo email ou employeeId já existem).
 *       '500':
 *         description: Erro interno do servidor.
 */
librarianRouter.put(
    '/id/:id',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    updateLibrarianById
);

/**
 * @swagger
 * /librarians/employee/{employeeId}:
 *   put:
 *     summary: Atualiza um bibliotecário por número de funcionário.
 *     tags: [Bibliotecários]
 *     description: >
 *       Modifica os dados de um bibliotecário existente, identificado pelo seu número de funcionário.
 *       Requer autenticação JWT e role de Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: Número de identificação do funcionário.
 *         schema:
 *           type: string
 *           example: "EMP12345"
 *     requestBody:
 *       required: true
 *       description: Objeto contendo os dados do bibliotecário para atualização.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLibrarian'
 *     responses:
 *       '200':
 *         description: Bibliotecário atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Librarian'
 *       '400':
 *         description: Dados de entrada inválidos.
 *       '401':
 *         description: Autenticação falhou.
 *       '403':
 *         description: Permissão negada (role inadequado).
 *       '404':
 *         description: Bibliotecário não encontrado.
 *       '409':
 *         description: >
 *           Conflito de dados (ex: novo email ou employeeId já existem).
 *       '500':
 *         description: Erro interno do servidor.
 */
librarianRouter.put(
    '/employee/:employeeId',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    updateLibrarianByEmployeeId
);

// All DELETE endpoints
/**
 * @swagger
 * /librarians/id/{id}:
 *   delete:
 *     summary: Remove um bibliotecário por ID.
 *     tags: [Bibliotecários]
 *     description: >
 *       Exclui um bibliotecário do sistema, identificado pelo seu ID (UUID).
 *       Requer autenticação JWT e role de Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID (UUID) do bibliotecário a ser removido.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Bibliotecário removido com sucesso (sem conteúdo na resposta).
 *       '401':
 *         description: Autenticação falhou.
 *       '403':
 *         description: Permissão negada (role inadequado).
 *       '404':
 *         description: Bibliotecário não encontrado.
 *       '409':
 *         description: >
 *           Conflito (ex: não é possível remover o último Admin).
 *       '500':
 *         description: Erro interno do servidor.
 */
librarianRouter.delete(
    '/id/:id',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    deleteLibrarianById
);

/**
 * @swagger
 * /librarians/employee/{employeeId}:
 *   delete:
 *     summary: Remove um bibliotecário por número de funcionário.
 *     tags: [Bibliotecários]
 *     description: >
 *       Exclui um bibliotecário do sistema, identificado pelo seu número de funcionário.
 *       Requer autenticação JWT e role de Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: Número de identificação do funcionário.
 *         schema:
 *           type: string
 *           example: "EMP12345"
 *     responses:
 *       '204':
 *         description: Bibliotecário removido com sucesso (sem conteúdo na resposta).
 *       '401':
 *         description: Autenticação falhou.
 *       '403':
 *         description: Permissão negada (role inadequado).
 *       '404':
 *         description: Bibliotecário não encontrado.
 *       '409':
 *         description: >
 *           Conflito (ex: não é possível remover o último Admin).
 *       '500':
 *         description: Erro interno do servidor.
 */
librarianRouter.delete(
    '/employee/:employeeId',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    deleteLibrarianByEmployeeId
);

/**
 * @swagger
 * /librarians:
 *   delete:
 *     summary: Remove todos os bibliotecários.
 *     tags: [Bibliotecários]
 *     description: >
 *       Exclui permanentemente todos os registros de bibliotecários do sistema. 
 *       Operação extremamente perigosa. Requer autenticação JWT e role de Admin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Todos os bibliotecários foram removidos com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteAllResult'
 *       '401':
 *         description: Autenticação falhou.
 *       '403':
 *         description: Permissão negada (role inadequado).
 *       '500':
 *         description: Erro interno do servidor.
 */
librarianRouter.delete(
    '/',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    deleteAllLibrarians
);

export default librarianRouter;
