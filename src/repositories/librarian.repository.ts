import { PrismaClient, Librarian, LibrarianRole } from '@prisma/client';

export class LibrarianRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async exists(): Promise<boolean> {
        const librarian = await this.prisma.librarian.findFirst();
        return librarian !== null;
    }

    async findAll(): Promise<Omit<Librarian, 'passwordHash'>[]> {
        const librarians = await this.prisma.librarian.findMany({
            select: { 
                id: true, 
                name: true, 
                email: true, 
                employeeId: true, 
                role: true, 
                createdAt: true, 
                updatedAt: true 
            }
        });
        return librarians;
    }

    async findById(id: string): Promise<Omit<Librarian, 'passwordHash'> | null> {
        const librarian = await this.prisma.librarian.findUnique({
            where: { id },
            select: { 
                id: true, 
                name: true, 
                email: true, 
                employeeId: true, 
                role: true, 
                createdAt: true, 
                updatedAt: true 
            }
        });
        return librarian;
    }

    async findByEmailWithPassword(email: string): Promise<Librarian | null> {
        return this.prisma.librarian.findUnique({
            where: { email }
        });
    }

    async findByEmployeeId(employeeId: string): Promise<Omit<Librarian, 'passwordHash'> | null> {
        const librarian = await this.prisma.librarian.findUnique({
            where: { employeeId },
            select: { 
                id: true, 
                name: true, 
                email: true, 
                employeeId: true, 
                role: true, 
                createdAt: true, 
                updatedAt: true 
            }
        });
        return librarian;
    }

    async create(data: { 
        name: string, 
        email: string, 
        employeeId: string, 
        passwordHash: string,
        role: LibrarianRole
    }): Promise<Omit<Librarian, 'passwordHash'>> {
        const librarian = await this.prisma.librarian.create({
            data,
            select: { 
                id: true, 
                name: true, 
                email: true, 
                employeeId: true, 
                role: true, 
                createdAt: true, 
                updatedAt: true 
            }
        });
        return librarian;
    }

    async updateById(id: string, data: { 
        name?: string, 
        email?: string, 
        employeeId?: string, 
        passwordHash?: string,
        role?: LibrarianRole
    }): Promise<Omit<Librarian, 'passwordHash'>> {
        const librarian = await this.prisma.librarian.update({
            where: { id },
            data,
            select: { 
                id: true, 
                name: true, 
                email: true, 
                employeeId: true, 
                role: true, 
                createdAt: true, 
                updatedAt: true 
            }
        });
        return librarian;
    }

    async updateByEmployeeId(employeeId: string, data: { 
        name?: string, 
        email?: string, 
        employeeId?: string, 
        passwordHash?: string,
        role?: LibrarianRole
    }): Promise<Omit<Librarian, 'passwordHash'>> {
        const librarian = await this.prisma.librarian.update({
            where: { employeeId },
            data,
            select: { 
                id: true, 
                name: true, 
                email: true, 
                employeeId: true, 
                role: true, 
                createdAt: true, 
                updatedAt: true 
            }
        });
        return librarian;
    }

    async deleteById(id: string): Promise<void> {
        await this.prisma.librarian.delete({ where: { id } });
    }

    async deleteByEmployeeId(employeeId: string): Promise<void> {
        await this.prisma.librarian.delete({ where: { employeeId } });
    }

    async deleteAll(): Promise<{ count: number }> {
        return this.prisma.librarian.deleteMany();
    }
}

// Singleton pattern para reutilização da instância
const librarianRepository = new LibrarianRepository();
export default librarianRepository;
