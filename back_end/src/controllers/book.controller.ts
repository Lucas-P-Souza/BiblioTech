import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cria um novo livro no sistema
// Permite criar usando nomes para as relações (em vez de IDs)
// Rota protegida por JWT
export const createBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            title,
            isbn,
            publishYear,
            coverImage,
            publisherName,
            authorNames,
            categoryNames
        } = req.body;

        // Validações de campos obrigatórios.
        if (!title || !isbn || !publisherName || publishYear === undefined) {
            res.status(400).json({ message: 'Título, ISBN, Nome da Editora e Ano de Publicação são obrigatórios.' });
            return;
        }
        if (!Array.isArray(authorNames) || authorNames.length === 0) {
            res.status(400).json({ message: 'Pelo menos um Nome de Autor é obrigatório.' });
            return;
        }
        if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
            res.status(400).json({ message: 'Pelo menos um Nome de Categoria é obrigatório.' });
            return;
        }

        const parsedPublishYear = typeof publishYear === 'string' 
            ? parseInt(publishYear, 10)
            : publishYear;
            
        if (isNaN(parsedPublishYear)) {
            res.status(400).json({ message: 'Ano de Publicação inválido. Deve ser um número.' });
            return;
        }

        const newBook = await prisma.book.create({
            data: {
                title,
                isbn,
                publicationYear: parsedPublishYear, // Changed from publishYear to publicationYear
                publisher: { 
                    connectOrCreate: { 
                        where: { name: publisherName }, 
                        create: { name: publisherName } 
                    } 
                },
                authors: { 
                    connectOrCreate: authorNames.map((name: string) => ({ 
                        where: { name }, 
                        create: { name } 
                    })) 
                },
                categories: { 
                    connectOrCreate: categoryNames.map((name: string) => ({ 
                        where: { name }, 
                        create: { name } 
                    })) 
                },
            },
            include: { authors: true, categories: true, publisher: true }
        });
        res.status(201).json(newBook);
    } catch (error: unknown) {
        console.error("Controller Error - createBook:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'Já existe um livro com este ISBN.' });
                return;
            }
        }
        res.status(500).json({ message: 'Erro interno ao criar o livro.' });
    }
};

// Lista todos os livros cadastrados
// Permite filtrar por título, ISBN, autor, categoria ou editora via query params
// Rota pública
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, isbn, authorName, categoryName, publisherName } = req.query;
        const whereClause: any = {};

        if (title && typeof title === 'string') whereClause.title = { contains: title, mode: 'insensitive' };
        if (isbn && typeof isbn === 'string') whereClause.isbn = { contains: isbn, mode: 'insensitive' };
        if (authorName && typeof authorName === 'string') {
            whereClause.authors = { some: { name: { contains: authorName, mode: 'insensitive' } } };
        }
        if (categoryName && typeof categoryName === 'string') {
            whereClause.categories = { some: { name: { contains: categoryName, mode: 'insensitive' } } };
        }
        if (publisherName && typeof publisherName === 'string') {
            whereClause.publisher = { name: { contains: publisherName, mode: 'insensitive' } };
        }

        const books = await prisma.book.findMany({
            where: whereClause,
            include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } },
        });
        res.status(200).json(books);
    } catch (error: unknown) {
        console.error("Controller Error - getAllBooks:", error);
        res.status(500).json({ message: 'Erro interno ao buscar livros.' });
    }
};

// Busca um livro específico pelo ID (UUID)
// Rota pública
export const getBookById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const book = await prisma.book.findUnique({
            where: { id },
            include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } },
        });
        if (!book) {
            res.status(404).json({ message: 'Livro não encontrado (ID).' }); return;
        }
        res.status(200).json(book);
    } catch (error: unknown) {
        console.error(`Controller Error - getBookById (ID: ${id}):`, error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// Busca livros com título exato
// Retorna um array de livros (vazio se nenhum for encontrado)
// Rota pública
export const getBooksByExactTitle = async (req: Request, res: Response): Promise<void> => {
    const bookTitle = req.params.title;
    try {
        const books = await prisma.book.findMany({ // Usa findMany pois o título não é mais único
            where: { title: bookTitle }, // Busca por título exato (case-sensitive por padrão, adicione mode: 'insensitive' se desejar)
            include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } },
        });

        // Retorna um array vazio se nenhum livro for encontrado, o que é um resultado válido.
        res.status(200).json(books);
    } catch (error: unknown) {
        console.error(`Controller Error - getBooksByExactTitle (Title: ${bookTitle}):`, error);
        res.status(500).json({ message: 'Erro interno ao buscar livros por título.' });
    }
};

// Busca um livro pelo ISBN (identificador único)
// Rota pública
export const getBookByIsbn = async (req: Request, res: Response): Promise<void> => {
    const { isbn } = req.params;
    try {
        const book = await prisma.book.findUnique({
            where: { isbn },
            include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } },
        });
        if (!book) {
            res.status(404).json({ message: 'Livro não encontrado (ISBN).' }); return;
        }
        res.status(200).json(book);
    } catch (error: unknown) {
        console.error(`Controller Error - getBookByIsbn (ISBN: ${isbn}):`, error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// Atualiza os dados de um livro pelo seu ID
// Rota protegida por JWT
export const updateBookById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, isbn, publicationYear: publicationYearInput, publisherName, authorNames, categoryNames } = req.body;

    if (title === undefined && isbn === undefined && publicationYearInput === undefined &&
        publisherName === undefined && authorNames === undefined && categoryNames === undefined) {
        res.status(400).json({ message: 'Nenhum dado para atualizar.' }); return;
    }
    try {
        const dataToUpdate: any = {};
        if (title !== undefined) dataToUpdate.title = title;
        if (isbn !== undefined) dataToUpdate.isbn = isbn;
        if (publicationYearInput !== undefined) {
            const parsedYear = parseInt(String(publicationYearInput), 10);
            if (isNaN(parsedYear)) { res.status(400).json({ message: 'Ano de publicação inválido.' }); return; }
            dataToUpdate.publicationYear = parsedYear; // Changed to publicationYear
        }
        if (publisherName !== undefined) dataToUpdate.publisher = { connectOrCreate: { where: { name: publisherName }, create: { name: publisherName } } };
        if (authorNames !== undefined) {
            if (!Array.isArray(authorNames)) { res.status(400).json({ message: 'authorNames deve ser um array.' }); return; }
            dataToUpdate.authors = { set: [], connectOrCreate: authorNames.map((name: string) => ({ where: { name }, create: { name } })) };
        }
        if (categoryNames !== undefined) {
            if (!Array.isArray(categoryNames)) { res.status(400).json({ message: 'categoryNames deve ser um array.' }); return; }
            dataToUpdate.categories = { set: [], connectOrCreate: categoryNames.map((name: string) => ({ where: { name }, create: { name } })) };
        }

        const updatedBook = await prisma.book.update({ where: { id }, data: dataToUpdate, include: { authors: true, categories: true, publisher: true } });
        res.status(200).json(updatedBook);
    } catch (error: unknown) {
        console.error(`Controller Error - updateBookById (ID: ${id}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Livro não encontrado ou ID relacionado inválido.' }); return; }
            if (error.code === 'P2002') { res.status(409).json({ message: 'ISBN duplicado ou outro campo único.' }); return; }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar.' });
    }
};

// Atualiza os dados de um livro pelo seu ISBN
// Rota protegida por JWT
export const updateBookByIsbn = async (req: Request, res: Response): Promise<void> => {
    const { isbn: isbnParam } = req.params;
    const { title, isbn: newIsbn, publicationYear: publicationYearInput, publisherName, authorNames, categoryNames } = req.body;

    if (title === undefined && newIsbn === undefined && publicationYearInput === undefined &&
        publisherName === undefined && authorNames === undefined && categoryNames === undefined) {
        res.status(400).json({ message: 'Nenhum dado para atualizar.' }); return;
    }

    try {
        const dataToUpdate: any = {};
        if (title !== undefined) dataToUpdate.title = title;
        if (newIsbn !== undefined) dataToUpdate.isbn = newIsbn;
        if (publicationYearInput !== undefined) {
            const parsedYear = parseInt(String(publicationYearInput), 10);
            if (isNaN(parsedYear)) { res.status(400).json({ message: 'Ano de publicação inválido.' }); return; }
            dataToUpdate.publicationYear = parsedYear; // Changed to publicationYear
        }
        if (publisherName !== undefined) dataToUpdate.publisher = { connectOrCreate: { where: { name: publisherName }, create: { name: publisherName } } };
        if (authorNames !== undefined) {
            if (!Array.isArray(authorNames)) { res.status(400).json({ message: 'authorNames deve ser um array.' }); return; }
            dataToUpdate.authors = { set: [], connectOrCreate: authorNames.map((name: string) => ({ where: { name }, create: { name } })) };
        }
        if (categoryNames !== undefined) {
            if (!Array.isArray(categoryNames)) { res.status(400).json({ message: 'categoryNames deve ser um array.' }); return; }
            dataToUpdate.categories = { set: [], connectOrCreate: categoryNames.map((name: string) => ({ where: { name }, create: { name } })) };
        }

        const updatedBook = await prisma.book.update({
            where: { isbn: isbnParam },
            data: dataToUpdate,
            include: { authors: true, categories: true, publisher: true }
        });
        res.status(200).json(updatedBook);
    } catch (error: unknown) {
        console.error(`Controller Error - updateBookByIsbn (ISBN: ${isbnParam}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Livro não encontrado com este ISBN, ou ID relacionado inválido.' }); return; }
            if (error.code === 'P2002') { res.status(409).json({ message: 'O novo ISBN fornecido já existe, ou outro campo único foi violado.' }); return; }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar o livro por ISBN.' });
    }
};

// Remove um livro pelo seu ID
// Rota protegida por JWT
export const deleteBookById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.book.delete({ where: { id } });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Controller Error - deleteBookById (ID: ${id}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Livro não encontrado (ID).' }); return; }
            if (error.code === 'P2003') { res.status(409).json({ message: 'Livro com dependências (exemplares/reservas).' }); return; }
        }
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// Remove um livro pelo seu ISBN
// Rota protegida por JWT
export const deleteBookByIsbn = async (req: Request, res: Response): Promise<void> => {
    const { isbn } = req.params;
    try {
        const bookExists = await prisma.book.findUnique({ where: { isbn } });
        if (!bookExists) {
            res.status(404).json({ message: 'Livro não encontrado com o ISBN fornecido para deleção.' });
            return;
        }
        await prisma.book.delete({ where: { isbn } });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Controller Error - deleteBookByIsbn (ISBN: ${isbn}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2003') {
            res.status(409).json({ message: 'Livro com dependências (exemplares/reservas).' }); return;
        }
        res.status(500).json({ message: 'Erro interno ao deletar o livro por ISBN.' });
    }
};

// Remove todos os livros do sistema
// Operação perigosa - restrita a Admin e Manager
export const deleteAllBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await prisma.book.deleteMany({});
        res.status(200).json({ message: 'Todos livros deletados (verificar dependências).', count: result.count });
    } catch (error: unknown) {
        console.error("Controller Error - deleteAllBooks:", error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// Nota: As operações por título foram removidas porque o título 
// não é considerado um identificador único seguro para edição/exclusão
