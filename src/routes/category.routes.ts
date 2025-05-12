import { Router } from 'express';
// Importa as funções do controller de categorias, focando nas operações por nome
import {
    getAllCategories,
    getCategoryByName,  // Para buscar uma categoria específica pelo nome
    createCategory,
    updateCategoryByName, // Para atualizar uma categoria pelo nome
    deleteCategoryByName, // Para deletar uma categoria pelo nome
    deleteAllCategories
} from '../controllers/category.controller';

// Importa os middlewares de autenticação e autorização
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
// Importa o enum LibrarianRole para usar na autorização por role
// Certifique-se que este import está funcionando (direto ou via Prisma.LibrarianRole)
import { LibrarianRole } from '@prisma/client';

const categoryRouter = Router();

// --- Rotas para /categories ---

// Rota PÚBLICA: Listar todas as categorias (ou filtrar por nome query ?name=)
categoryRouter.get('/', getAllCategories);

// Rota PÚBLICA: Buscar uma categoria específica pelo NOME
// O nome na URL deve ser URL-encoded se tiver espaços/caracteres especiais (ex: /categories/by-name/Ficção%20Científica)
categoryRouter.get('/by-name/:name', getCategoryByName);

// Rota PRIVADA: Criar uma nova categoria
// Requer token JWT para autenticação.
categoryRouter.post('/', authenticateToken, createCategory);

// Rota PRIVADA: Atualizar uma categoria específica pelo NOME
// O nome na URL (currentName) identifica a categoria a ser atualizada.
// Os novos dados (incluindo um possível novo nome) vêm no corpo da requisição.
categoryRouter.put('/by-name/:name', authenticateToken, updateCategoryByName);

// Rota PRIVADA: Deletar uma categoria específica pelo NOME
categoryRouter.delete('/by-name/:name', authenticateToken, deleteCategoryByName);

// Rota PRIVADA e RESTRITA A ROLES: Deletar TODAS as categorias
categoryRouter.delete(
    '/', // Rota: DELETE /categories
    authenticateToken, // Primeiro, verifica se está autenticado
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager), // Depois, verifica se tem o role permitido
    deleteAllCategories // Só executa se os dois middlewares anteriores passarem
);

// Se você decidir adicionar rotas por ID (UUID) para Categoria no futuro, elas seriam adicionadas aqui.
// Exemplo:
// import { getCategoryById, updateCategoryById, deleteCategoryById } from '../controllers/category.controller';
// categoryRouter.get('/id/:id', getCategoryById);
// categoryRouter.put('/id/:id', authenticateToken, updateCategoryById);
// categoryRouter.delete('/id/:id', authenticateToken, deleteCategoryById);

export default categoryRouter;
