import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- CRIAR um novo livro (usando nomes para relações) ---
export const createBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, isbn, publicationYear: publicationYearInput, publisherName, authorNames, categoryNames } = req.body;
        if (!title || !isbn || !publisherName || publicationYearInput === undefined) {
            res.status(400).json({ message: 'Título, ISBN, Nome da Editora e Ano de Publicação são obrigatórios.' }); return;
        }
        if (!Array.isArray(authorNames) || authorNames.length === 0) {
            res.status(400).json({ message: 'Pelo menos um Nome de Autor é obrigatório.' }); return;
        }
        if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
            res.status(400).json({ message: 'Pelo menos um Nome de Categoria é obrigatório.' }); return;
        }
        const parsedPublicationYear = parseInt(String(publicationYearInput), 10);
        if (isNaN(parsedPublicationYear)) {
            res.status(400).json({ message: 'Ano de Publicação inválido.' }); return;
        }

        const newBook = await prisma.book.create({
            data: {
                title, isbn, publicationYear: parsedPublicationYear,
                publisher: { connectOrCreate: { where: { name: publisherName }, create: { name: publisherName } } },
                authors: { connectOrCreate: authorNames.map((name: string) => ({ where: { name }, create: { name } })) },
                categories: { connectOrCreate: categoryNames.map((name: string) => ({ where: { name }, create: { name } })) },
            },
            include: { authors: true, categories: true, publisher: true }
        });
        res.status(201).json(newBook);
    } catch (error: unknown) {
        console.error("Erro ao criar livro:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2002') { res.status(409).json({ message: 'Já existe um livro com este ISBN (ou outro campo único violado).' }); return; }
            if (error.code === 'P2025') { res.status(400).json({ message: 'Editora, autor ou categoria com nome fornecido não pôde ser conectado ou criado (verifique se nomes são únicos nos seus respectivos cadastros se o problema for na criação aninhada).' }); return; }
        }
        res.status(500).json({ message: 'Erro interno ao criar o livro.' });
    }
};

// --- LISTAR todos os livros ---
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
    // (Esta função continua igual à versão anterior que te passei, com filtros, etc.)
    try {
        const { title, isbn, authorName, categoryName, publisherName } = req.query;
        const whereClause: any = {};
        if (title && typeof title === 'string') whereClause.title = { contains: title, mode: 'insensitive' };
        if (isbn && typeof isbn === 'string') whereClause.isbn = { contains: isbn, mode: 'insensitive' };
        if (authorName && typeof authorName === 'string') whereClause.authors = { some: { name: { contains: authorName, mode: 'insensitive' } } };
        if (categoryName && typeof categoryName === 'string') whereClause.categories = { some: { name: { contains: categoryName, mode: 'insensitive' } } };
        if (publisherName && typeof publisherName === 'string') whereClause.publisher = { name: { contains: publisherName, mode: 'insensitive' } };
        const books = await prisma.book.findMany({ where: whereClause, include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } } });
        res.status(200).json(books);
    } catch (error: unknown) {
        console.error("Erro ao listar livros:", error);
        res.status(500).json({ message: 'Erro interno ao buscar livros.' });
    }
};

// --- BUSCAR um livro pelo ID ---
export const getBookById = async (req: Request, res: Response): Promise<void> => {
    // (Esta função continua igual)
    const { id } = req.params;
    try {
        const book = await prisma.book.findUnique({ where: { id }, include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } } });
        if (!book) { res.status(404).json({ message: 'Livro não encontrado (por ID).' }); return; }
        res.status(200).json(book);
    } catch (error: unknown) {
        console.error(`Erro ao buscar livro com ID ${id}:`, error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// --- ATUALIZAR um livro pelo ID ---
export const updateBookById = async (req: Request, res: Response): Promise<void> => {
    // (Esta função continua igual, mas renomeada para clareza - se você a chamava de updateBook antes)
    const { id } = req.params;
    const { title, isbn, publicationYear: publicationYearInput, publisherName, authorNames, categoryNames } = req.body;
    if (title === undefined && isbn === undefined && publicationYearInput === undefined && publisherName === undefined && authorNames === undefined && categoryNames === undefined) {
        res.status(400).json({ message: 'Nenhum dado para atualizar.' }); return;
    }
    try {
        const dataToUpdate: any = {};
        if (title !== undefined) dataToUpdate.title = title;
        if (isbn !== undefined) dataToUpdate.isbn = isbn;
        if (publicationYearInput !== undefined) {
            const parsedYear = parseInt(String(publicationYearInput), 10);
            if (isNaN(parsedYear)) { res.status(400).json({ message: 'Ano de publicação inválido.' }); return; }
            dataToUpdate.publicationYear = parsedYear;
        }
        if (publisherName !== undefined) dataToUpdate.publisher = { connectOrCreate: { where: { name: publisherName }, create: { name: publisherName } } };
        if (authorNames !== undefined) dataToUpdate.authors = { set: [], connectOrCreate: authorNames.map((name: string) => ({ where: { name }, create: { name } })) };
        if (categoryNames !== undefined) dataToUpdate.categories = { set: [], connectOrCreate: categoryNames.map((name: string) => ({ where: { name }, create: { name } })) };

        const updatedBook = await prisma.book.update({ where: { id }, data: dataToUpdate, include: { authors: true, categories: true, publisher: true } });
        res.status(200).json(updatedBook);
    } catch (error: unknown) {
        console.error(`Erro ao atualizar livro ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Livro não encontrado ou ID relacionado inválido.' }); return; }
            if (error.code === 'P2002') { res.status(409).json({ message: 'ISBN duplicado ou outro campo único.' }); return; }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar.' });
    }
};

// --- DELETAR um livro pelo ID ---
export const deleteBookById = async (req: Request, res: Response): Promise<void> => {
    // (Esta função continua igual, mas renomeada para clareza)
    const { id } = req.params;
    try {
        await prisma.book.delete({ where: { id } });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Erro ao deletar livro ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Livro não encontrado.' }); return; }
            if (error.code === 'P2003') { res.status(409).json({ message: 'Livro com dependências (exemplares/reservas).' }); return; }
        }
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// --- DELETAR TODOS os livros ---
export const deleteAllBooks = async (req: Request, res: Response): Promise<void> => {
    // (Esta função continua igual)
    try {
        const result = await prisma.book.deleteMany({});
        res.status(200).json({ message: 'Todos livros deletados (verificar dependências).', count: result.count });
    } catch (error: unknown) {
        console.error("Erro ao deletar todos os livros:", error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};


// --- NOVAS FUNÇÕES: OPERAÇÕES POR ISBN ---

// --- BUSCAR um livro pelo ISBN ---
export const getBookByIsbn = async (req: Request, res: Response): Promise<void> => {
    const { isbn } = req.params; // ISBN vem da URL
    try {
        const book = await prisma.book.findUnique({
            where: { isbn }, // Busca pelo campo ISBN (que é @unique)
            include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } },
        });

        if (!book) {
            res.status(404).json({ message: 'Livro não encontrado com o ISBN fornecido.' });
            return;
        }
        res.status(200).json(book);
    } catch (error: unknown) {
        console.error(`Erro ao buscar livro com ISBN ${isbn}:`, error);
        res.status(500).json({ message: 'Erro interno ao buscar o livro por ISBN.' });
    }
};

// --- ATUALIZAR um livro pelo ISBN ---
export const updateBookByIsbn = async (req: Request, res: Response): Promise<void> => {
    const { isbn: isbnParam } = req.params; // ISBN atual vindo da URL
    const { title, isbn: newIsbn, publicationYear: publicationYearInput, publisherName, authorNames, categoryNames } = req.body;

    if (title === undefined && newIsbn === undefined && publicationYearInput === undefined &&
        publisherName === undefined && authorNames === undefined && categoryNames === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' }); return;
    }

    try {
        const dataToUpdate: any = {};
        if (title !== undefined) dataToUpdate.title = title;
        if (newIsbn !== undefined) dataToUpdate.isbn = newIsbn; // Se for atualizar o ISBN
        if (publicationYearInput !== undefined) {
            const parsedYear = parseInt(String(publicationYearInput), 10);
            if (isNaN(parsedYear)) { res.status(400).json({ message: 'Ano de publicação inválido.' }); return; }
            dataToUpdate.publicationYear = parsedYear;
        }
        if (publisherName !== undefined) dataToUpdate.publisher = { connectOrCreate: { where: { name: publisherName }, create: { name: publisherName } } };
        if (authorNames !== undefined) dataToUpdate.authors = { set: [], connectOrCreate: authorNames.map((name: string) => ({ where: { name }, create: { name } })) };
        if (categoryNames !== undefined) dataToUpdate.categories = { set: [], connectOrCreate: categoryNames.map((name: string) => ({ where: { name }, create: { name } })) };

        const updatedBook = await prisma.book.update({
            where: { isbn: isbnParam }, // Busca pelo ISBN atual para atualizar
            data: dataToUpdate,
            include: { authors: true, categories: true, publisher: true }
        });
        res.status(200).json(updatedBook);
    } catch (error: unknown) {
        console.error(`Erro ao atualizar livro com ISBN ${isbnParam}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Livro não encontrado com este ISBN, ou um nome/ID relacionado inválido.' }); return; }
            if (error.code === 'P2002') { res.status(409).json({ message: 'O novo ISBN fornecido já existe, ou outro campo único foi violado.' }); return; }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar o livro por ISBN.' });
    }
};

// --- DELETAR um livro pelo ISBN ---
export const deleteBookByIsbn = async (req: Request, res: Response): Promise<void> => {
    const { isbn } = req.params;
    try {
        // Para ser mais robusto, poderia verificar se o livro existe primeiro com findUnique
        // já que `delete` em um campo `@unique` que não seja o ID pode não dar P2025 se não achar,
        // mas sim simplesmente não deletar nada ou dar outro erro se a sintaxe for para `deleteMany`.
        // Usando `delete` com `where: { isbn }` é o correto para um campo único.
        const bookToDelete = await prisma.book.findUnique({ where: { isbn } });
        if (!bookToDelete) {
            res.status(404).json({ message: 'Livro não encontrado com o ISBN fornecido para deleção.' });
            return;
        }

        await prisma.book.delete({
            where: { isbn }, // Deleta pelo campo ISBN (que é @unique)
        });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Erro ao deletar livro com ISBN ${isbn}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            // P2025 pode não ser o erro se o ISBN não for achado pelo `delete` em si, mas sim pelo `findUnique` acima.
            if (error.code === 'P2003') { // Foreign key constraint failed
                res.status(409).json({ message: 'Livro não pode ser deletado (por ISBN), pois possui exemplares ou reservas.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro interno ao deletar o livro por ISBN.' });
    }
};