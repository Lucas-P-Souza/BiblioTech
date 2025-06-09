import { PrismaClient, Book } from '@prisma/client';

export class BookRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findAll(filter: {
        title?: string;
        isbn?: string;
        authorName?: string;
        categoryName?: string;
        publisherName?: string;
    } = {}): Promise<any[]> {
        const whereClause: any = {};

        if (filter.title) whereClause.title = { contains: filter.title, mode: 'insensitive' };
        if (filter.isbn) whereClause.isbn = { contains: filter.isbn, mode: 'insensitive' };
        if (filter.authorName) {
            whereClause.authors = { some: { name: { contains: filter.authorName, mode: 'insensitive' } } };
        }
        if (filter.categoryName) {
            whereClause.categories = { some: { name: { contains: filter.categoryName, mode: 'insensitive' } } };
        }
        if (filter.publisherName) {
            whereClause.publisher = { name: { contains: filter.publisherName, mode: 'insensitive' } };
        }

        return this.prisma.book.findMany({
            where: whereClause,
            include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } },
        });
    }

    async findById(id: string): Promise<any | null> {
        return this.prisma.book.findUnique({
            where: { id },
            include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } },
        });
    }

    async findByIsbn(isbn: string): Promise<any | null> {
        return this.prisma.book.findUnique({
            where: { isbn },
            include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } },
        });
    }

    async findByTitle(title: string): Promise<any[]> {
        return this.prisma.book.findMany({
            where: { title },
            include: { authors: true, categories: true, publisher: true, items: { select: { id: true, status: true } } },
        });
    }

    async create(data: any): Promise<any> {
        return this.prisma.book.create({
            data,
            include: { authors: true, categories: true, publisher: true }
        });
    }

    async updateById(id: string, data: any): Promise<any> {
        return this.prisma.book.update({
            where: { id },
            data,
            include: { authors: true, categories: true, publisher: true }
        });
    }

    async updateByIsbn(isbn: string, data: any): Promise<any> {
        return this.prisma.book.update({
            where: { isbn },
            data,
            include: { authors: true, categories: true, publisher: true }
        });
    }

    async deleteById(id: string): Promise<void> {
        await this.prisma.book.delete({ where: { id } });
    }

    async deleteByIsbn(isbn: string): Promise<void> {
        await this.prisma.book.delete({ where: { isbn } });
    }

    async deleteAll(): Promise<{ count: number }> {
        return this.prisma.book.deleteMany();
    }
}

// Singleton pattern para reutilização da instância
const bookRepository = new BookRepository();
export default bookRepository;
