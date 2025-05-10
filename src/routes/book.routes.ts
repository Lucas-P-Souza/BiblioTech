import { Router } from 'express';
import {
    createBook,
    getAllBooks,
    getBookById,
    updateBookById,    // Renomeado de updateBook para clareza
    deleteBookById,    // Renomeado de deleteBook para clareza
    deleteAllBooks,
    getBookByIsbn,     // <-- NOVO
    updateBookByIsbn,  // <-- NOVO
    deleteBookByIsbn   // <-- NOVO
} from '../controllers/book.controller';

const bookRouter = Router();

// --- Rotas para /books ---

// GET /books -> Listar todos (com filtros)
bookRouter.get('/', getAllBooks);

// POST /books -> Criar novo livro (usando nomes para relações)
bookRouter.post('/', createBook);

// DELETE /books -> Deletar TODOS os livros (CUIDADO!)
bookRouter.delete('/', deleteAllBooks);


// --- Rotas específicas por ID (UUID) ---
bookRouter.get('/id/:id', getBookById);         // Ex: /books/id/uuid-do-livro
bookRouter.put('/id/:id', updateBookById);      // Ex: /books/id/uuid-do-livro
bookRouter.delete('/id/:id', deleteBookById);   // Ex: /books/id/uuid-do-livro


// --- NOVAS Rotas específicas por ISBN ---
bookRouter.get('/isbn/:isbn', getBookByIsbn);       // Ex: /books/isbn/978-0618640157
bookRouter.put('/isbn/:isbn', updateBookByIsbn);    // Ex: /books/isbn/978-0618640157
bookRouter.delete('/isbn/:isbn', deleteBookByIsbn); // Ex: /books/isbn/978-0618640157


export default bookRouter;