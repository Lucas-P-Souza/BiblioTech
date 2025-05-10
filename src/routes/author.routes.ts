import { Router } from 'express';
// Importa TODAS as funções do nosso controller de autores
import {
    getAllAuthors,
    createAuthor,
    getAuthorById,
    updateAuthor,
    deleteAuthor,
    deleteAllAuthors // Função para deletar todos
} from '../controllers/author.controller';

const authorRouter = Router();

// --- Rotas para /authors ---

// GET /authors -> Listar todos (com filtro opcional por nome: ?name=...)
authorRouter.get('/', getAllAuthors);

// POST /authors -> Criar um novo autor
authorRouter.post('/', createAuthor);

// GET /authors/:id -> Buscar um autor específico pelo ID
authorRouter.get('/:id', getAuthorById);

// PUT /authors/:id -> Atualizar um autor específico pelo ID
authorRouter.put('/:id', updateAuthor);

// DELETE /authors/:id -> Deletar um autor específico pelo ID
authorRouter.delete('/:id', deleteAuthor);

// DELETE /authors -> Deletar TODOS os autores
authorRouter.delete('/', deleteAllAuthors); // Esta é a rota para deletar todos

export default authorRouter;