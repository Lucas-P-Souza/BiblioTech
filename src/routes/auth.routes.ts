import { Router } from 'express';
import { loginLibrarian } from '../controllers/auth.controller';

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Endpoints para autenticação de bibliotecários.
 */

/**
 * @swagger
 * /auth/librarian/login:
 *   post:
 *     summary: Realiza o login de um bibliotecário no sistema.
 *     tags: 
 *       - Autenticação
 *     description: Autentica um bibliotecário com base no email e senha e retorna um token JWT em caso de sucesso.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       '200':
 *         description: Login bem-sucedido. Retorna token e dados do bibliotecário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '400':
 *         description: Dados de entrada inválidos (ex- email ou senha não fornecidos).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Credenciais inválidas (email não encontrado ou senha incorreta).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Erro interno no servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/librarian/login', loginLibrarian);

export default authRouter;
