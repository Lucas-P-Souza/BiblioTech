import { PrismaClient, Author } from '@prisma/client';

export class AuthorRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findAll(nameFilter?: string): Promise<Author[]> {
        if (nameFilter && nameFilter.trim() !== '') {
            return this.prisma.author.findMany({
                where: {
                    name: {
                        contains: nameFilter,
                        mode: 'insensitive',
                    },
                },
            });
        } else {
            return this.prisma.author.findMany();
        }
    }

    async findById(id: string): Promise<Author | null> {
        return this.prisma.author.findUnique({
            where: { id },
        });
    }

    async findByName(name: string): Promise<Author | null> {
        return this.prisma.author.findUnique({
            where: { name },
        });
    }

    async create(data: { name: string, biography?: string | null }): Promise<Author> {
        return this.prisma.author.create({ data });
    }

    async updateById(id: string, data: { name?: string, biography?: string | null }): Promise<Author> {
        return this.prisma.author.update({
            where: { id },
            data,
        });
    }

    async updateByName(name: string, data: { name?: string, biography?: string | null }): Promise<Author> {
        return this.prisma.author.update({
            where: { name },
            data,
        });
    }

    async deleteById(id: string): Promise<Author> {
        return this.prisma.author.delete({ where: { id } });
    }

    async deleteByName(name: string): Promise<Author> {
        return this.prisma.author.delete({ where: { name } });
    }

    async deleteAll(): Promise<{ count: number }> {
        return this.prisma.author.deleteMany();
    }
}

// Singleton pattern para reutilização da instância
const authorRepository = new AuthorRepository();
export default authorRepository;
