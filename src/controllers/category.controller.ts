import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- FUNÇÕES CRUD EXISTENTES (getAllCategories, getCategoryById, createCategory, etc.) ---
// (Mantenha todo o código que já estava aqui para as funções anteriores)

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.query;
        let categories;
        if (name && typeof name === 'string' && name.trim() !== '') {
            categories = await prisma.category.findMany({
                where: { name: { contains: name, mode: 'insensitive' } },
            });
        } else {
            categories = await prisma.category.findMany();
        }
        res.status(200).json(categories);
    } catch (error: unknown) {
        console.error("Erro ao listar categorias:", error);
        res.status(500).json({ message: 'Erro interno ao buscar categorias.' });
    }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) {
            res.status(404).json({ message: 'Categoria não encontrada com o ID fornecido.' });
            return;
        }
        res.status(200).json(category);
    } catch (error: unknown) {
        console.error(`Erro ao buscar categoria com ID ${id}:`, error);
        res.status(500).json({ message: 'Erro interno ao buscar a categoria.' });
    }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ message: 'O campo "name" (nome da categoria) é obrigatório.' });
            return;
        }
        const newCategory = await prisma.category.create({ data: { name, description } });
        res.status(201).json(newCategory);
    } catch (error: unknown) {
        console.error("Erro ao criar categoria:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            res.status(409).json({ message: 'Já existe uma categoria com este nome.' });
            return;
        }
        res.status(500).json({ message: 'Erro interno ao criar a categoria.' });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (name === '') {
        res.status(400).json({ message: 'O nome não pode ser vazio para atualização.' });
        return;
    }
    if (name === undefined && description === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    try {
        const dataToUpdate: { name?: string; description?: string } = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (description !== undefined) dataToUpdate.description = description;
        const updatedCategory = await prisma.category.update({ where: { id }, data: dataToUpdate });
        res.status(200).json(updatedCategory);
    } catch (error: unknown) {
        console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Categoria não encontrada para atualização.' }); return;
            }
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'Já existe uma categoria com este nome.' }); return;
            }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar a categoria.' });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.category.delete({ where: { id } });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Erro ao deletar categoria com ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2025') {
            res.status(404).json({ message: 'Categoria não encontrada para deleção.' }); return;
        }
        // Adicione tratamento para P2003 se Categoria tem livros associados e a deleção é restrita
        res.status(500).json({ message: 'Erro interno ao deletar a categoria.' });
    }
};

export const deleteAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteResult = await prisma.category.deleteMany({});
        res.status(200).json({ message: 'Todas as categorias foram deletadas.', count: deleteResult.count });
    } catch (error: unknown) {
        console.error("Erro ao deletar todas as categorias:", error);
        res.status(500).json({ message: 'Erro interno ao deletar todas as categorias.' });
    }
};


// --- NOVAS FUNÇÕES PARA ATUALIZAR E DELETAR POR NOME ---

// --- ATUALIZAR uma categoria pelo NOME ---
export const updateCategoryByName = async (req: Request, res: Response): Promise<void> => {
    const categoryName = req.params.name; // Pega o nome dos parâmetros da rota
    const { name, description } = req.body; // Novos dados para atualizar

    if (name === '') { // Se o novo 'name' foi enviado, não pode ser vazio
        res.status(400).json({ message: 'O novo nome não pode ser vazio para atualização.' });
        return;
    }
    // Se nenhum campo for enviado para atualização
    if (name === undefined && description === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; description?: string } = {};
        if (name !== undefined) dataToUpdate.name = name; // Novo nome
        if (description !== undefined) dataToUpdate.description = description;

        const updatedCategory = await prisma.category.update({
            where: { name: categoryName }, // Busca pelo nome atual para atualizar
            data: dataToUpdate,
        });
        res.status(200).json(updatedCategory);
    } catch (error: unknown) {
        console.error(`Erro ao atualizar categoria com nome ${categoryName}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { // Registro para atualizar não encontrado (nenhuma categoria com esse nome)
                res.status(404).json({ message: 'Categoria não encontrada para atualização pelo nome fornecido.' });
                return;
            }
            if (error.code === 'P2002') { // Violação de constraint única (se o novo nome já existir)
                res.status(409).json({ message: 'Já existe uma categoria com o novo nome fornecido.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar a categoria pelo nome.' });
    }
};

// --- DELETAR uma categoria pelo NOME ---
export const deleteCategoryByName = async (req: Request, res: Response): Promise<void> => {
    const categoryName = req.params.name; // Pega o nome dos parâmetros da rota
    try {
        // Primeiro, verificamos se a categoria existe para dar uma mensagem 404 mais precisa
        // já que deleteMany não retorna erro se nada for deletado.
        const categoryExists = await prisma.category.findUnique({
            where: { name: categoryName },
        });

        if (!categoryExists) {
            res.status(404).json({ message: 'Categoria não encontrada para deleção pelo nome fornecido.' });
            return;
        }

        // Se existe, tentamos deletar. deleteMany é usado aqui porque where em campo não-id/não-unique
        // poderia, em teoria, afetar múltiplos registros se 'name' não fosse unique.
        // Mas como estamos assumindo/garantindo que 'name' é unique, isso vai deletar no máximo 1.
        await prisma.category.delete({
            where: { name: categoryName },
        });
        res.status(204).send(); // 204 No Content
    } catch (error: unknown) {
        console.error(`Erro ao deletar categoria com nome ${categoryName}:`, error);
        // Se o erro P2025 ocorrer aqui, é inesperado, pois já verificamos a existência.
        // Mas podemos tratar outros erros, como P2003 (foreign key constraint)
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2003') {
            res.status(409).json({ message: 'Não é possível deletar a categoria pois ela está associada a um ou mais livros.' });
            return;
        }
        res.status(500).json({ message: 'Erro interno ao deletar a categoria pelo nome.' });
    }
};