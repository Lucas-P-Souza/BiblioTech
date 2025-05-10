import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- LISTAR todos os autores (com filtro opcional por nome) ---
export const getAllAuthors = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.query;
        let authors;

        if (name && typeof name === 'string' && name.trim() !== '') {
            authors = await prisma.author.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive',
                    },
                },
            });
        } else {
            authors = await prisma.author.findMany();
        }
        res.status(200).json(authors);
    } catch (error: unknown) {
        console.error("Erro ao listar autores:", error);
        res.status(500).json({ message: 'Erro interno ao buscar autores.' });
    }
};

// --- BUSCAR um autor pelo ID ---
export const getAuthorById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const author = await prisma.author.findUnique({
            where: { id },
        });

        if (!author) {
            res.status(404).json({ message: 'Autor não encontrado com o ID fornecido.' });
            return;
        }
        res.status(200).json(author);
    } catch (error: unknown) {
        // Tratar erros como ID inválido no formato UUID, se necessário
        console.error(`Erro ao buscar autor com ID ${id}:`, error);
        res.status(500).json({ message: 'Erro interno ao buscar o autor.' });
    }
};

// --- CRIAR um novo autor ---
export const createAuthor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, biography } = req.body;

        if (!name) {
            res.status(400).json({ message: 'O campo "name" é obrigatório.' });
            return;
        }

        const newAuthor = await prisma.author.create({
            data: { name, biography },
        });
        res.status(201).json(newAuthor);
    } catch (error: unknown) {
        console.error("Erro ao criar autor:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            // Supondo que 'name' no seu schema.prisma possa ter uma constraint @unique
            // Ou qualquer outro campo que possa causar P2002 (unique constraint violation)
            res.status(409).json({ message: 'Já existe um autor com estes dados (ex: nome duplicado).' });
            return;
        }
        res.status(500).json({ message: 'Erro interno ao criar o autor.' });
    }
};

// --- ATUALIZAR um autor existente ---
export const updateAuthor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, biography } = req.body;

    if (name === '') { // Se 'name' foi enviado, não pode ser vazio
        res.status(400).json({ message: 'O nome não pode ser vazio para atualização.' });
        return;
    }
    if (name === undefined && biography === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; biography?: string } = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (biography !== undefined) dataToUpdate.biography = biography;

        const updatedAuthor = await prisma.author.update({
            where: { id },
            data: dataToUpdate,
        });
        res.status(200).json(updatedAuthor);
    } catch (error: unknown) {
        console.error(`Erro ao atualizar autor com ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { // Registro para atualizar não encontrado
                res.status(404).json({ message: 'Autor não encontrado para atualização.' });
                return;
            }
            if (error.code === 'P2002') { // Violação de constraint única
                res.status(409).json({ message: 'Já existe um autor com este nome (ou outro campo único).' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar o autor.' });
    }
};

// --- DELETAR um autor específico pelo ID ---
export const deleteAuthor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.author.delete({
            where: { id },
        });
        res.status(204).send(); // 204 No Content
    } catch (error: unknown) {
        console.error(`Erro ao deletar autor com ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2025') {
            res.status(404).json({ message: 'Autor não encontrado para deleção.' });
            return;
        }
        res.status(500).json({ message: 'Erro interno ao deletar o autor.' });
    }
};

// --- DELETAR TODOS os autores ---
export const deleteAllAuthors = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteResult = await prisma.author.deleteMany({});
        res.status(200).json({
            message: 'Todos os autores foram deletados com sucesso.',
            count: deleteResult.count
        });
    } catch (error: unknown) {
        console.error("Erro ao deletar todos os autores:", error);
        res.status(500).json({ message: 'Erro interno ao deletar todos os autores.' });
    }
};