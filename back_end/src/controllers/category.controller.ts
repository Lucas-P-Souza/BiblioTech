import { Request, Response } from 'express';
import categoryRepository from '../repositories/category.repository';

// Lista todas as categorias com filtro opcional
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.query;
        const nameFilter = name && typeof name === 'string' ? name : undefined;
        
        const categories = await categoryRepository.findAll(nameFilter);
        res.status(200).json(categories);
    } catch (error: unknown) {
        console.error("Controller Error - getAllCategories:", error);
        res.status(500).json({ message: 'Erro ao buscar categorias.' });
    }
};

// Busca uma categoria pelo nome
export const getCategoryByName = async (req: Request, res: Response): Promise<void> => {
    const categoryName = req.params.name;
    try {
        const category = await categoryRepository.findByName(categoryName);

        if (!category) {
            res.status(404).json({ message: 'Categoria não encontrada com o nome fornecido.' });
            return;
        }
        res.status(200).json(category);
    } catch (error: unknown) {
        console.error(`Controller Error - getCategoryByName (Name: ${categoryName}):`, error);
        res.status(500).json({ message: 'Erro ao buscar categoria por nome.' });
    }
};

// Cria uma nova categoria
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        if (!name) {
            res.status(400).json({ message: 'O campo "name" (nome da categoria) é obrigatório.' });
            return;
        }

        const newCategory = await categoryRepository.create({ name, description });
        res.status(201).json(newCategory);
    } catch (error: unknown) {
        console.error("Controller Error - createCategory:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            res.status(409).json({ message: 'Já existe uma categoria com este nome.' });
            return;
        }
        res.status(500).json({ message: 'Erro ao criar categoria.' });
    }
};

// Atualiza uma categoria pelo nome
export const updateCategoryByName = async (req: Request, res: Response): Promise<void> => {
    const currentName = req.params.name;
    const { name: newName, description } = req.body;

    if (newName === undefined && description === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    if (newName === '') {
        res.status(400).json({ message: 'O novo nome não pode ser vazio para atualização.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; description?: string } = {};
        if (newName !== undefined) dataToUpdate.name = newName;
        if (description !== undefined) dataToUpdate.description = description;

        const updatedCategory = await categoryRepository.updateByName(currentName, dataToUpdate);
        res.status(200).json(updatedCategory);
    } catch (error: unknown) {
        console.error(`Controller Error - updateCategoryByName (Nome Atual: ${currentName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Categoria não encontrada para atualização (nome).' });
                return;
            }
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'Já existe uma categoria com o novo nome fornecido.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro ao atualizar categoria por nome.' });
    }
};

// Remove uma categoria pelo nome
export const deleteCategoryByName = async (req: Request, res: Response): Promise<void> => {
    const categoryName = req.params.name;
    try {
        const categoryExists = await categoryRepository.findByName(categoryName);

        if (!categoryExists) {
            res.status(404).json({ message: 'Categoria não encontrada para deleção (nome).' });
            return;
        }

        await categoryRepository.deleteByName(categoryName);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Controller Error - deleteCategoryByName (Name: ${categoryName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2003') {
            res.status(409).json({ message: 'Não é possível deletar a categoria, pois ela está associada a um ou mais livros.' });
            return;
        }
        res.status(500).json({ message: 'Erro ao deletar categoria por nome.' });
    }
};

// Remove todas as categorias do sistema
export const deleteAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteResult = await categoryRepository.deleteAll();
        res.status(200).json({
            message: 'Todas as categorias foram deletadas (que não estavam em uso por livros, dependendo das constraints).',
            count: deleteResult.count
        });
    } catch (error: unknown) {
        console.error("Controller Error - deleteAllCategories:", error);
        res.status(500).json({ message: 'Erro ao deletar todas as categorias.' });
    }
};
