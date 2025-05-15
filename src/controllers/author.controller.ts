import { Request, Response } from 'express';
import authorRepository from '../repositories/author.repository';

// Retorna todos os autores cadastrados
// Permite filtrar por nome via parâmetro de consulta
export const getAllAuthors = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.query;
        const nameFilter = name && typeof name === 'string' ? name : undefined;
        const authors = await authorRepository.findAll(nameFilter);
        res.status(200).json(authors);
    } catch (error: unknown) {
        console.error("Controller Error - getAllAuthors:", error);
        res.status(500).json({ message: 'Erro ao buscar autores.' });
    }
};

// Busca um autor específico pelo seu ID (UUID)
export const getAuthorById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const author = await authorRepository.findById(id);

        if (!author) {
            res.status(404).json({ message: 'Autor não encontrado (ID).' });
            return;
        }
        res.status(200).json(author);
    } catch (error: unknown) {
        console.error(`Controller Error - getAuthorById (ID: ${id}):`, error);
        res.status(500).json({ message: 'Erro ao buscar autor por ID.' });
    }
};

// Busca um autor pelo nome exato
// Requer que o campo 'name' seja único na tabela de autores
export const getAuthorByName = async (req: Request, res: Response): Promise<void> => {
    const authorName = req.params.name;
    try {
        const author = await authorRepository.findByName(authorName);

        if (!author) {
            res.status(404).json({ message: 'Autor não encontrado (Nome).' });
            return;
        }
        res.status(200).json(author);
    } catch (error: unknown) {
        console.error(`Controller Error - getAuthorByName (Nome: ${authorName}):`, error);
        res.status(500).json({ message: 'Erro ao buscar autor por nome.' });
    }
};

// Cria um novo autor no sistema
export const createAuthor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, biography } = req.body;

        if (!name) {
            res.status(400).json({ message: 'O campo "name" é obrigatório.' });
            return;
        }

        const newAuthor = await authorRepository.create({ name, biography });
        res.status(201).json(newAuthor);
    } catch (error: unknown) {
        console.error("Controller Error - createAuthor:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            res.status(409).json({ message: 'Já existe um autor com este nome.' });
            return;
        }
        res.status(500).json({ message: 'Erro ao criar autor.' });
    }
};

// Atualiza os dados de um autor pelo seu ID
export const updateAuthorById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, biography } = req.body;

    if (name === undefined && biography === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    if (name === '') {
        res.status(400).json({ message: 'O nome não pode ser vazio para atualização.' });
        return;
    }
    try {
        const dataToUpdate: { name?: string; biography?: string } = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (biography !== undefined) dataToUpdate.biography = biography;
        
        const updatedAuthor = await authorRepository.updateById(id, dataToUpdate);
        res.status(200).json(updatedAuthor);
    } catch (error: unknown) {
        console.error(`Controller Error - updateAuthorById (ID: ${id}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Autor não encontrado para atualização (ID).' }); return;
            }
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'Já existe um autor com o novo nome fornecido.' }); return;
            }
        }
        res.status(500).json({ message: 'Erro ao atualizar autor por ID.' });
    }
};

// Atualiza os dados de um autor pelo seu nome
// Requer que o campo 'name' seja único na tabela de autores
export const updateAuthorByName = async (req: Request, res: Response): Promise<void> => {
    const currentName = req.params.name;
    const { name: newName, biography } = req.body;
    if (newName === undefined && biography === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    if (newName === '') {
        res.status(400).json({ message: 'O novo nome não pode ser vazio para atualização.' });
        return;
    }
    try {
        const dataToUpdate: { name?: string; biography?: string } = {};
        if (newName !== undefined) dataToUpdate.name = newName;
        if (biography !== undefined) dataToUpdate.biography = biography;
        
        const updatedAuthor = await authorRepository.updateByName(currentName, dataToUpdate);
        res.status(200).json(updatedAuthor);
    } catch (error: unknown) {
        console.error(`Controller Error - updateAuthorByName (Nome Atual: ${currentName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Autor não encontrado para atualização (nome).' }); return;
            }
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'Já existe um autor com o novo nome fornecido.' }); return;
            }
        }
        res.status(500).json({ message: 'Erro ao atualizar autor por nome.' });
    }
};

// Remove um autor pelo seu nome
// Requer que o campo 'name' seja único na tabela de autores
export const deleteAuthorByName = async (req: Request, res: Response): Promise<void> => {
    const authorName = req.params.name;
    try {
        const authorExists = await authorRepository.findByName(authorName);
        if (!authorExists) {
            res.status(404).json({ message: 'Autor não encontrado para deleção (nome).' }); 
            return;
        }
        
        await authorRepository.deleteByName(authorName);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Controller Error - deleteAuthorByName (Name: ${authorName}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2003') {
            res.status(409).json({ message: 'Não é possível deletar o autor, pois ele está associado a livros.' }); 
            return;
        }
        res.status(500).json({ message: 'Erro ao deletar autor por nome.' });
    }
};

// Remove um autor pelo seu ID
export const deleteAuthorById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await authorRepository.deleteById(id);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Controller Error - deleteAuthorById (ID: ${id}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Autor não encontrado para deleção (ID).' }); 
                return;
            }
            if (error.code === 'P2003') {
                res.status(409).json({ message: 'Não é possível deletar o autor, pois ele está associado a livros.' }); 
                return;
            }
        }
        res.status(500).json({ message: 'Erro ao deletar autor por ID.' });
    }
};

// Remove todos os autores do sistema
// Observação: autores associados a livros podem não ser removidos,
// dependendo da configuração de restrições do banco de dados
export const deleteAllAuthors = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteResult = await authorRepository.deleteAll();
        res.status(200).json({
            message: 'Todos os autores foram deletados (que não estavam em uso por livros, dependendo das constraints).',
            count: deleteResult.count
        });
    } catch (error: unknown) {
        console.error("Controller Error - deleteAllAuthors:", error);
        res.status(500).json({ message: 'Erro ao deletar todos os autores.' });
    }
};
