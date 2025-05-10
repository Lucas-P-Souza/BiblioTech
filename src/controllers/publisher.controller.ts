import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- LISTAR todas as editoras (com filtro opcional por nome) ---
export const getAllPublishers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.query;
        let publishers;

        if (name && typeof name === 'string' && name.trim() !== '') {
            publishers = await prisma.publisher.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive',
                    },
                },
            });
        } else {
            publishers = await prisma.publisher.findMany();
        }
        res.status(200).json(publishers);
    } catch (error: unknown) {
        console.error("Erro ao listar editoras:", error);
        res.status(500).json({ message: 'Erro interno ao buscar editoras.' });
    }
};

// --- BUSCAR uma editora pelo ID ---
export const getPublisherById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const publisher = await prisma.publisher.findUnique({
            where: { id },
        });

        if (!publisher) {
            res.status(404).json({ message: 'Editora não encontrada com o ID fornecido.' });
            return;
        }
        res.status(200).json(publisher);
    } catch (error: unknown) {
        console.error(`Erro ao buscar editora com ID ${id}:`, error);
        res.status(500).json({ message: 'Erro interno ao buscar a editora.' });
    }
};

// --- CRIAR uma nova editora ---
export const createPublisher = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, address, contactInfo } = req.body;

        if (!name) {
            res.status(400).json({ message: 'O campo "name" (nome da editora) é obrigatório.' });
            return;
        }

        const newPublisher = await prisma.publisher.create({
            data: { name, address, contactInfo },
        });
        res.status(201).json(newPublisher);
    } catch (error: unknown) {
        console.error("Erro ao criar editora:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            res.status(409).json({ message: 'Já existe uma editora com este nome.' });
            return;
        }
        res.status(500).json({ message: 'Erro interno ao criar a editora.' });
    }
};

// --- ATUALIZAR uma editora existente (pelo ID) ---
export const updatePublisherById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, address, contactInfo } = req.body;

    if (name === '') {
        res.status(400).json({ message: 'O nome não pode ser vazio para atualização.' });
        return;
    }
    if (name === undefined && address === undefined && contactInfo === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; address?: string; contactInfo?: string } = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (address !== undefined) dataToUpdate.address = address;
        if (contactInfo !== undefined) dataToUpdate.contactInfo = contactInfo;

        const updatedPublisher = await prisma.publisher.update({
            where: { id },
            data: dataToUpdate,
        });
        res.status(200).json(updatedPublisher);
    } catch (error: unknown) {
        console.error(`Erro ao atualizar editora com ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Editora não encontrada para atualização.' });
                return;
            }
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'Já existe uma editora com este nome (para o novo nome).' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar a editora.' });
    }
};

// --- DELETAR uma editora específica pelo ID ---
export const deletePublisherById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.publisher.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Erro ao deletar editora com ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Editora não encontrada para deleção.' });
                return;
            }
            if (error.code === 'P2003') { // Foreign key constraint failed
                res.status(409).json({ message: 'Não é possível deletar a editora pois ela está associada a um ou mais livros.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro interno ao deletar a editora.' });
    }
};

// --- DELETAR TODAS as editoras ---
export const deleteAllPublishers = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteResult = await prisma.publisher.deleteMany({});
        res.status(200).json({
            message: 'Todas as editoras foram deletadas com sucesso (que não estavam em uso por livros, dependendo das constraints).',
            count: deleteResult.count
        });
    } catch (error: unknown) {
        console.error("Erro ao deletar todas as editoras:", error);
        res.status(500).json({ message: 'Erro interno ao deletar todas as editoras.' });
    }
};

// --- ATUALIZAR uma editora pelo NOME ---
export const updatePublisherByName = async (req: Request, res: Response): Promise<void> => {
    const publisherNameParam = req.params.name; // Nome atual vindo da URL
    const { name, address, contactInfo } = req.body; // Novos dados

    if (name === '') { // Se um novo 'name' foi enviado, não pode ser vazio
        res.status(400).json({ message: 'O novo nome não pode ser vazio para atualização.' });
        return;
    }
    if (name === undefined && address === undefined && contactInfo === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; address?: string; contactInfo?: string } = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (address !== undefined) dataToUpdate.address = address;
        if (contactInfo !== undefined) dataToUpdate.contactInfo = contactInfo;

        const updatedPublisher = await prisma.publisher.update({
            where: { name: publisherNameParam }, // Busca pelo nome atual para atualizar
            data: dataToUpdate,
        });
        res.status(200).json(updatedPublisher);
    } catch (error: unknown) {
        console.error(`Erro ao atualizar editora com nome ${publisherNameParam}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Editora não encontrada para atualização pelo nome fornecido.' });
                return;
            }
            if (error.code === 'P2002') { // Se o NOVO nome já existir
                res.status(409).json({ message: 'Já existe uma editora com o novo nome fornecido.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar a editora pelo nome.' });
    }
};

// --- DELETAR uma editora pelo NOME ---
export const deletePublisherByName = async (req: Request, res: Response): Promise<void> => {
    const publisherNameParam = req.params.name;
    try {
        const publisherExists = await prisma.publisher.findUnique({
            where: { name: publisherNameParam },
        });

        if (!publisherExists) {
            res.status(404).json({ message: 'Editora não encontrada para deleção pelo nome fornecido.' });
            return;
        }

        await prisma.publisher.delete({ // Usamos delete pois 'name' é @unique
            where: { name: publisherNameParam },
        });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Erro ao deletar editora com nome ${publisherNameParam}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2003') {
            res.status(409).json({ message: 'Não é possível deletar a editora pois ela está associada a um ou mais livros.' });
            return;
        }
        res.status(500).json({ message: 'Erro interno ao deletar a editora pelo nome.' });
    }
};