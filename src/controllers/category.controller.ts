import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// LISTAR todas as categorias.
// Permite filtrar por nome se o query param 'name' for fornecido (ex: /categories?name=Ficção)
// Esta rota é PÚBLICA.
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.query; // Extrai o parâmetro 'name' da query string.
        let categories;

        if (name && typeof name === 'string' && name.trim() !== '') {
            // Busca categorias contendo o termo (case-insensitive).
            categories = await prisma.category.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive',
                    },
                },
            });
        } else {
            // Busca todas as categorias se nenhum nome for fornecido.
            categories = await prisma.category.findMany();
        }
        res.status(200).json(categories);
    } catch (error: unknown) {
        console.error("Controller Error - getAllCategories:", error);
        res.status(500).json({ message: 'Erro ao buscar categorias.' });
    }
};

// BUSCAR uma categoria específica pelo NOME.
// O nome é fornecido como parâmetro na rota (ex: /categories/by-name/Ficção%20Científica).
// Esta rota é PÚBLICA.
// Requer que 'name' seja @unique no schema para Category.
export const getCategoryByName = async (req: Request, res: Response): Promise<void> => {
    const categoryName = req.params.name; // Extrai o nome dos parâmetros da rota.
    try {
        const category = await prisma.category.findUnique({
            where: { name: categoryName }, // Busca pelo nome (que deve ser único).
        });

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

// CRIAR uma nova categoria.
// Esta rota é PRIVADA (requer autenticação JWT).
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        if (!name) {
            res.status(400).json({ message: 'O campo "name" (nome da categoria) é obrigatório.' });
            return;
        }

        const newCategory = await prisma.category.create({
            data: { name, description },
        });
        res.status(201).json(newCategory); // 201: Created
    } catch (error: unknown) {
        console.error("Controller Error - createCategory:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            res.status(409).json({ message: 'Já existe uma categoria com este nome.' }); // 409: Conflict
            return;
        }
        res.status(500).json({ message: 'Erro ao criar categoria.' });
    }
};

// ATUALIZAR uma categoria existente, identificada pelo NOME ATUAL.
// O novo nome e/ou descrição são fornecidos no corpo da requisição.
// Esta rota é PRIVADA.
// Requer que 'name' seja @unique no schema.
export const updateCategoryByName = async (req: Request, res: Response): Promise<void> => {
    const currentName = req.params.name; // Nome atual da categoria, vindo da URL.
    const { name: newName, description } = req.body; // Novos dados.

    if (newName === undefined && description === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    if (newName === '') { // Se um novo nome for fornecido, não pode ser vazio.
        res.status(400).json({ message: 'O novo nome não pode ser vazio para atualização.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; description?: string } = {};
        if (newName !== undefined) dataToUpdate.name = newName;
        if (description !== undefined) dataToUpdate.description = description;

        const updatedCategory = await prisma.category.update({
            where: { name: currentName }, // Busca pelo nome atual para realizar a atualização.
            data: dataToUpdate,
        });
        res.status(200).json(updatedCategory);
    } catch (error: unknown) {
        console.error(`Controller Error - updateCategoryByName (Nome Atual: ${currentName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { // Categoria com 'currentName' não encontrada.
                res.status(404).json({ message: 'Categoria não encontrada para atualização (nome).' });
                return;
            }
            if (error.code === 'P2002') { // Violação de constraint única (se o 'newName' já existir).
                res.status(409).json({ message: 'Já existe uma categoria com o novo nome fornecido.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro ao atualizar categoria por nome.' });
    }
};

// DELETAR uma categoria específica pelo NOME.
// Esta rota é PRIVADA.
// Requer que 'name' seja @unique no schema.
export const deleteCategoryByName = async (req: Request, res: Response): Promise<void> => {
    const categoryName = req.params.name; // Nome da categoria a ser deletada.
    try {
        const categoryExists = await prisma.category.findUnique({
            where: { name: categoryName },
        });

        if (!categoryExists) {
            res.status(404).json({ message: 'Categoria não encontrada para deleção (nome).' });
            return;
        }

        await prisma.category.delete({
            where: { name: categoryName },
        });
        res.status(204).send(); // 204: No Content
    } catch (error: unknown) {
        console.error(`Controller Error - deleteCategoryByName (Name: ${categoryName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2003') {
            // Erro se a categoria estiver associada a livros e a deleção for restrita.
            res.status(409).json({ message: 'Não é possível deletar a categoria, pois ela está associada a um ou mais livros.' });
            return;
        }
        res.status(500).json({ message: 'Erro ao deletar categoria por nome.' });
    }
};

// DELETAR TODAS as categorias.
// Esta rota é PRIVADA e idealmente restrita a roles específicos (ex: Admin).
export const deleteAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteResult = await prisma.category.deleteMany({});
        res.status(200).json({
            message: 'Todas as categorias foram deletadas (que não estavam em uso por livros, dependendo das constraints).',
            count: deleteResult.count
        });
    } catch (error: unknown) {
        console.error("Controller Error - deleteAllCategories:", error);
        res.status(500).json({ message: 'Erro ao deletar todas as categorias.' });
    }
};
