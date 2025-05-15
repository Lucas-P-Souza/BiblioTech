import { PrismaClient, Publisher } from '@prisma/client';

export class PublisherRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findAll(nameFilter?: string): Promise<Publisher[]> {
        if (nameFilter && nameFilter.trim() !== '') {
            return this.prisma.publisher.findMany({
                where: {
                    name: {
                        contains: nameFilter,
                        mode: 'insensitive',
                    },
                },
            });
        } else {
            return this.prisma.publisher.findMany();
        }
    }

    async findById(id: string): Promise<Publisher | null> {
        return this.prisma.publisher.findUnique({
            where: { id },
        });
    }

    async findByName(name: string): Promise<Publisher | null> {
        return this.prisma.publisher.findUnique({
            where: { name },
        });
    }

    async create(data: { name: string, address?: string | null, contactInfo?: string | null }): Promise<Publisher> {
        return this.prisma.publisher.create({ data });
    }

    async updateById(id: string, data: { name?: string, address?: string | null, contactInfo?: string | null }): Promise<Publisher> {
        return this.prisma.publisher.update({
            where: { id },
            data,
        });
    }

    async updateByName(name: string, data: { name?: string, address?: string | null, contactInfo?: string | null }): Promise<Publisher> {
        return this.prisma.publisher.update({
            where: { name },
            data,
        });
    }

    async deleteById(id: string): Promise<Publisher> {
        return this.prisma.publisher.delete({ where: { id } });
    }

    async deleteByName(name: string): Promise<Publisher> {
        return this.prisma.publisher.delete({ where: { name } });
    }

    async deleteAll(): Promise<{ count: number }> {
        return this.prisma.publisher.deleteMany();
    }
}

// Singleton pattern para reutilização da instância
const publisherRepository = new PublisherRepository();
export default publisherRepository;
