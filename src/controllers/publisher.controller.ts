import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Retorna todas as editoras cadastradas
// Permite filtrar por nome via query parameter (busca parcial, case-insensitive)
export const getAllPublishers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.query; // Extrai o parâmetro 'name' da query string.
        let publishers;

        if (name && typeof name === 'string' && name.trim() !== '') {
            publishers = await prisma.publisher.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive', // Busca case-insensitive.
                    },
                },
            });
        } else {
            publishers = await prisma.publisher.findMany(); // Busca todas se nenhum nome for fornecido.
        }
        res.status(200).json(publishers);
    } catch (error: unknown) {
        console.error("Controller Error - getAllPublishers:", error);
        res.status(500).json({ message: 'Erro ao buscar editoras.' });
    }
};

// Busca uma editora pelo seu nome exato
// Requer que o campo 'name' seja único na tabela de editoras
export const getPublisherByName = async (req: Request, res: Response): Promise<void> => {
    const publisherName = req.params.name; // Extrai o nome dos parâmetros da rota.
    try {
        const publisher = await prisma.publisher.findUnique({
            where: { name: publisherName }, // Busca pelo nome (que deve ser único).
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

// Busca uma editora pelo seu ID (UUID)
export const getPublisherById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Extrai o 'id' dos parâmetros da rota.
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

// Cria uma nova editora no sistema
// Requer autenticação (JWT)
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
        res.status(201).json(newPublisher); // 201: Created
    } catch (error: unknown) {
        console.error("Controller Error - createPublisher:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            // Erro de constraint única (ex: nome duplicado, se 'name' for @unique).
            res.status(409).json({ message: 'Já existe uma editora com este nome.' }); // 409: Conflict
            return;
        }
        res.status(500).json({ message: 'Erro ao criar editora.' });
    }
};

// Atualiza os dados de uma editora pelo seu ID
// Requer autenticação (JWT)
export const updatePublisherById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // ID da editora a ser atualizada.
    const { name, address, contactInfo } = req.body; // Novos dados.

    if (name === undefined && address === undefined && contactInfo === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    if (name === '') { // Se 'name' foi enviado, não pode ser uma string vazia.
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
            if (error.code === 'P2025') { // Registro para atualizar não encontrado.
                res.status(404).json({ message: 'Editora não encontrada para atualização (ID).' });
                return;
            }
            if (error.code === 'P2002') { // Violação de constraint única (novo nome já existe).
                res.status(409).json({ message: 'Já existe uma editora com o novo nome fornecido.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro ao atualizar editora por ID.' });
    }
};

// Atualiza os dados de uma editora pelo seu nome
// Requer autenticação (JWT) e que o campo 'name' seja único
export const updatePublisherByName = async (req: Request, res: Response): Promise<void> => {
    const currentName = req.params.name; // Nome atual da editora, vindo da URL.
    const { name: newName, address, contactInfo } = req.body; // Novos dados.

    if (newName === undefined && address === undefined && contactInfo === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    if (newName === '') { // Se um novo nome for fornecido, não pode ser vazio.
        res.status(400).json({ message: 'O novo nome não pode ser vazio para atualização.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; address?: string; contactInfo?: string } = {};
        if (newName !== undefined) dataToUpdate.name = newName;
        if (address !== undefined) dataToUpdate.address = address;
        if (contactInfo !== undefined) dataToUpdate.contactInfo = contactInfo;

        const updatedPublisher = await prisma.publisher.update({
            where: { name: currentName }, // Busca pelo nome atual para realizar a atualização.
            data: dataToUpdate,
        });
        res.status(200).json(updatedPublisher);
    } catch (error: unknown) {
        console.error(`Controller Error - updatePublisherByName (Nome Atual: ${currentName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { // Editora com 'currentName' não encontrada.
                res.status(404).json({ message: 'Editora não encontrada para atualização (nome).' });
                return;
            }
            if (error.code === 'P2002') { // Violação de constraint única (se o 'newName' já existir).
                res.status(409).json({ message: 'Já existe uma editora com o novo nome fornecido.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro ao atualizar editora por nome.' });
    }
};

// Remove uma editora pelo seu nome
// Requer autenticação (JWT) e que o campo 'name' seja único
export const deletePublisherByName = async (req: Request, res: Response): Promise<void> => {
    const publisherName = req.params.name; // Nome da editora a ser deletada.
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
        res.status(204).send(); // 204: No Content
    } catch (error: unknown) {
        console.error(`Controller Error - deletePublisherByName (Name: ${publisherName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2003') {
            // Erro se a editora estiver associada a livros e a deleção for restrita.
            res.status(409).json({ message: 'Não é possível deletar a editora, pois ela está associada a um ou mais livros.' });
            return;
        }
        res.status(500).json({ message: 'Erro ao deletar editora por nome.' });
    }
};

// Remove uma editora pelo seu ID
// Requer autenticação (JWT)
export const deletePublisherById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // ID da editora a ser deletada.
    try {
        await prisma.publisher.delete({
            where: { id },
        });
        res.status(204).send(); // 204: No Content.
    } catch (error: unknown) {
        console.error(`Controller Error - deletePublisherById (ID: ${id}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { // Registro para deletar não encontrado.
                res.status(404).json({ message: 'Editora não encontrada para deleção (ID).' });
                return;
            }
            if (error.code === 'P2003') { // Erro de chave estrangeira.
                res.status(409).json({ message: 'Não é possível deletar a editora, pois ela está associada a um ou mais livros.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro ao deletar editora por ID.' });
    }
};

// Remove todas as editoras do sistema
// Operação perigosa - deve ser restrita por role
// Editoras associadas a livros podem não ser removidas,
// dependendo das restrições configuradas no banco de dados
export const deleteAllPublishers = async (req: Request, res: Response): Promise<void> => {
    try {
        // CUIDADO: Se editoras estiverem ligadas a livros e a constraint for restritiva,
        // o deleteMany pode falhar ou deletar apenas as não associadas.
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
