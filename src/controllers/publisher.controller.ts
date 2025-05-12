import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Instância do Prisma Client para interagir com o banco de dados.
const prisma = new PrismaClient();

// Busca todas as editoras. Permite filtrar por nome via query parameter '?name=...'.
// A busca por nome é case-insensitive e procura por nomes que contenham o termo.
// Esta rota é PÚBLICA.
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

// Busca uma editora específica pelo seu NOME.
// O nome é fornecido como parâmetro na rota.
// Esta rota é PÚBLICA. Requer que 'name' seja @unique no schema.
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

// Busca uma editora específica pelo seu ID (UUID).
// Esta rota é PÚBLICA.
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

// Cria uma nova editora.
// Esta rota é PRIVADA (requer autenticação JWT).
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

// Atualiza uma editora existente, identificada pelo seu ID (UUID).
// Esta rota é PRIVADA.
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

// Atualiza uma editora existente, identificada pelo seu NOME ATUAL.
// Esta rota é PRIVADA. Requer que 'name' seja @unique no schema.
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

// Deleta uma editora específica pelo seu NOME.
// Esta rota é PRIVADA. Requer que 'name' seja @unique no schema.
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

// Deleta uma editora específica pelo seu ID (UUID).
// Esta rota é PRIVADA.
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

// Deleta TODAS as editoras.
// Esta rota é PRIVADA e idealmente restrita a roles específicos (ex: Admin).
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
