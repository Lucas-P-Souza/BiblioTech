import { Router } from 'express';
import {
    getAllCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
    deleteAllCategories,
    updateCategoryByName, // <--- NOVA IMPORTAÇÃO
    deleteCategoryByName  // <--- NOVA IMPORTAÇÃO
} from '../controllers/category.controller';

const categoryRouter = Router();

// Rotas para /categories
categoryRouter.get('/', getAllCategories);
categoryRouter.post('/', createCategory);

// Rotas que usam ID
categoryRouter.get('/:id', getCategoryById);
categoryRouter.put('/:id', updateCategory);
categoryRouter.delete('/:id', deleteCategory);

// Rota para deletar todas as categorias
categoryRouter.delete('/', deleteAllCategories);

// --- NOVAS ROTAS para operar pelo NOME ---
// Lembre-se que o :name na URL precisa ser URL-Encoded se tiver espaços ou caracteres especiais
// Ex: /categories/by-name/Ficção%20Científica

// PUT /categories/by-name/:name -> Atualizar uma categoria específica pelo NOME
categoryRouter.put('/by-name/:name', updateCategoryByName);

// DELETE /categories/by-name/:name -> Deletar uma categoria específica pelo NOME
categoryRouter.delete('/by-name/:name', deleteCategoryByName);

export default categoryRouter;