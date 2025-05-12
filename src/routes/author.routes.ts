import { Router } from 'express';
// Importa as funções do controller de autores com os nomes corretos
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthorById,
  updateAuthorByName,
  deleteAuthorByName,
  deleteAuthorById,
  deleteAllAuthors
} from '../controllers/author.controller';

// Importa os middlewares de autenticação e autorização
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
// Importa o enum LibrarianRole para usar na autorização por role
// Certifique-se que este import está funcionando corretamente no seu ambiente
// (se deu erro antes, pode ser necessário usar Prisma.LibrarianRole e importar Prisma)
import { LibrarianRole } from '@prisma/client';

const authorRouter = Router();

// --- Rotas para /authors ---

// Rota PÚBLICA: Listar todos os autores (ou filtrar por nome query ?name=)
authorRouter.get('/', getAllAuthors);

// Rota PÚBLICA: Buscar um autor específico pelo ID (UUID)
authorRouter.get('/id/:id', getAuthorById);

// Rota PRIVADA: Criar um novo autor
// O middleware 'authenticateToken' é executado ANTES da função 'createAuthor'.
// Se o token não for válido, 'createAuthor' nem será chamado.
authorRouter.post('/', authenticateToken, createAuthor);

// Rota PRIVADA: Atualizar um autor específico pelo ID (UUID)
authorRouter.put('/id/:id', authenticateToken, updateAuthorById);

// Rota PRIVADA: Atualizar um autor específico pelo NOME
authorRouter.put('/by-name/:name', authenticateToken, updateAuthorByName);

// Rota PRIVADA: Deletar um autor específico pelo NOME
authorRouter.delete('/by-name/:name', authenticateToken, deleteAuthorByName);

// Rota PRIVADA: Deletar um autor específico pelo ID (UUID)
authorRouter.delete('/id/:id', authenticateToken, deleteAuthorById);

// Rota PRIVADA e RESTRITA A ROLES: Deletar TODOS os autores
authorRouter.delete(
  '/', // Rota: DELETE /authors
  authenticateToken, // Primeiro, verifica se está autenticado
  authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager), // Depois, verifica se tem o role permitido
  deleteAllAuthors // Só executa se os dois middlewares anteriores passarem
);

export default authorRouter;
