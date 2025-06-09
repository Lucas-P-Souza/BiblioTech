import { PrismaClient, Category } from '@prisma/client';

export class CategoryRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findAll(nameFilter?: string): Promise<Category[]> {
        if (nameFilter && nameFilter.trim() !== '') {
            return this.prisma.category.findMany({
                where: {
                    name: {
                        contains: nameFilter,
                        mode: 'insensitive',
                    },
                },
            });
        } else {
            return this.prisma.category.findMany();
        }
    }

    async findByName(name: string): Promise<Category | null> {
        return this.prisma.category.findUnique({
            where: { name },
        });
    }

    async create(data: { name: string, description?: string | null }): Promise<Category> {
        return this.prisma.category.create({ data });
    }

    async updateByName(name: string, data: { name?: string, description?: string | null }): Promise<Category> {
        return this.prisma.category.update({
            where: { name },
            data,
        });
    }

    async deleteByName(name: string): Promise<Category> {
        return this.prisma.category.delete({
            where: { name },
        });
    }

    async deleteAll(): Promise<{ count: number }> {
        return this.prisma.category.deleteMany();
    }
}

// Singleton pattern para reutilização da instância
const categoryRepository = new CategoryRepository();
export default categoryRepository;
