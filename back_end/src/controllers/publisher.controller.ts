import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        console.error("Controller Error - getAllPublishers:", error);
        res.status(500).json({ message: 'Erro ao buscar editoras.' });
    }
};

export const getPublisherByName = async (req: Request, res: Response): Promise<void> => {
    const publisherName = req.params.name;
    try {
        const publisher = await prisma.publisher.findUnique({
            where: { name: publisherName },
        });

        if (!publisher) {
            res.status(404).json({ message: 'Editora não encontrada com o nome fornecido.' });
            return;
        }
        res.status(200).json(publisher);
    } catch (error: unknown) {
        console.error(`Controller Error - getPublisherByName (Name: ${publisherName}):`, error);
        res.status(500).json({ message: 'Erro ao buscar editora por nome.' });
    }
};

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
        console.error(`Controller Error - getPublisherById (ID: ${id}):`, error);
        res.status(500).json({ message: 'Erro ao buscar editora por ID.' });
    }
};

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
        console.error("Controller Error - createPublisher:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            res.status(409).json({ message: 'Já existe uma editora com este nome.' });
            return;
        }
        res.status(500).json({ message: 'Erro ao criar editora.' });
    }
};

export const updatePublisherById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, address, contactInfo } = req.body;

    if (name === undefined && address === undefined && contactInfo === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    if (name === '') {
        res.status(400).json({ message: 'O nome não pode ser vazio para atualização.' });
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
        console.error(`Controller Error - updatePublisherById (ID: ${id}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Editora não encontrada para atualização (ID).' });
                return;
            }
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'Já existe uma editora com o novo nome fornecido.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro ao atualizar editora por ID.' });
    }
};

export const updatePublisherByName = async (req: Request, res: Response): Promise<void> => {
    const currentName = req.params.name;
    const { name: newName, address, contactInfo } = req.body;

    if (newName === undefined && address === undefined && contactInfo === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    if (newName === '') {
        res.status(400).json({ message: 'O novo nome não pode ser vazio para atualização.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; address?: string; contactInfo?: string } = {};
        if (newName !== undefined) dataToUpdate.name = newName;
        if (address !== undefined) dataToUpdate.address = address;
        if (contactInfo !== undefined) dataToUpdate.contactInfo = contactInfo;

        const updatedPublisher = await prisma.publisher.update({
            where: { name: currentName },
            data: dataToUpdate,
        });
        res.status(200).json(updatedPublisher);
    } catch (error: unknown) {
        console.error(`Controller Error - updatePublisherByName (Nome Atual: ${currentName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Editora não encontrada para atualização (nome).' });
                return;
            }
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'Já existe uma editora com o novo nome fornecido.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro ao atualizar editora por nome.' });
    }
};

export const deletePublisherByName = async (req: Request, res: Response): Promise<void> => {
    const publisherName = req.params.name;
    try {
        const publisherExists = await prisma.publisher.findUnique({
            where: { name: publisherName },
        });

        if (!publisherExists) {
            res.status(404).json({ message: 'Editora não encontrada para deleção (nome).' });
            return;
        }

        await prisma.publisher.delete({
            where: { name: publisherName },
        });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Controller Error - deletePublisherByName (Name: ${publisherName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2003') {
            res.status(409).json({ message: 'Não é possível deletar a editora, pois ela está associada a um ou mais livros.' });
            return;
        }
        res.status(500).json({ message: 'Erro ao deletar editora por nome.' });
    }
};

export const deletePublisherById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.publisher.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Controller Error - deletePublisherById (ID: ${id}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Editora não encontrada para deleção (ID).' });
                return;
            }
            if (error.code === 'P2003') {
                res.status(409).json({ message: 'Não é possível deletar a editora, pois ela está associada a um ou mais livros.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro ao deletar editora por ID.' });
    }
};

export const deleteAllPublishers = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteResult = await prisma.publisher.deleteMany({});
        res.status(200).json({
            message: 'Todas as editoras foram deletadas (que não estavam em uso por livros, dependendo das constraints).',
            count: deleteResult.count
        });
    } catch (error: unknown) {
        console.error("Controller Error - deleteAllPublishers:", error);
        res.status(500).json({ message: 'Erro ao deletar todas as editoras.' });
    }
};
