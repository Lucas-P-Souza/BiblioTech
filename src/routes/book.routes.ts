import { Router } from 'express';
// Importa as funções do controller de livros
import {
    createBook,
    getAllBooks,
    getBookById,
    getBooksByExactTitle, // Renomeado para refletir que retorna um array
    updateBookById,
    updateBookByIsbn,   // Mantendo update por ISBN
    deleteBookById,
    deleteBookByIsbn,   // Mantendo delete por ISBN
    deleteAllBooks
} from '../controllers/book.controller';

// Importa os middlewares de autenticação e autorização
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
// Importa o enum LibrarianRole para usar na autorização por role
import { LibrarianRole } from '@prisma/client';

const bookRouter = Router();

// --- Rotas para /books ---

// Rotas PÚBLICAS (Leitura de Livros)
bookRouter.get('/', getAllBooks);                         // Listar todos (com filtros)
bookRouter.get('/id/:id', getBookById);                 // Buscar por ID (UUID)         // Buscar por ISBN (que é único)
bookRouter.get('/title/:title', getBooksByExactTitle);  // Buscar por Título Exato (retorna array)

// Rota PRIVADA: Criar um novo livro
bookRouter.post('/', authenticateToken, createBook);

// Rotas PRIVADAS: Atualizar um livro (usando ID ou ISBN)
bookRouter.put('/id/:id', authenticateToken, updateBookById);
bookRouter.put('/isbn/:isbn', authenticateToken, updateBookByIsbn);

// Rotas PRIVADAS: Deletar um livro (usando ID ou ISBN)
bookRouter.delete('/id/:id', authenticateToken, deleteBookById);
bookRouter.delete('/isbn/:isbn', authenticateToken, deleteBookByIsbn);

// Rota PRIVADA e RESTRITA A ROLES: Deletar TODOS os livros
bookRouter.delete(
    '/',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    deleteAllBooks
);

// As rotas para updateBookByTitle e deleteBookByTitle foram removidas
// porque o título do livro não é um identificador único seguro para essas operações.

export default bookRouter;
