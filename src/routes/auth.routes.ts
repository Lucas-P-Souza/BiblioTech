import { Router } from 'express';
// Importa a função de login do controller de autenticação
import { loginLibrarian } from '../controllers/auth.controller';

// Cria uma nova instância do roteador do Express
const authRouter = Router();

// Define a rota para o login de Bibliotecários
// Método HTTP: POST
// Caminho completo quando montado no index.ts: /auth/librarian/login
authRouter.post('/librarian/login', loginLibrarian);

// TODO: No futuro, poderia haver outras rotas de autenticação aqui, como:
// - /auth/refresh-token (para renovar um token JWT expirado usando um refresh token)
// - /auth/logout (para invalidar um token no lado do servidor, se estiver usando blacklist)
// - /auth/user/login (se usuários comuns também tivessem um sistema de login)

// Exporta o roteador para ser usado no arquivo principal do servidor (index.ts)
export default authRouter;
