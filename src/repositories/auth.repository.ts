import { PrismaClient, Librarian } from '@prisma/client';

export class AuthRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findLibrarianByEmail(email: string): Promise<Librarian | null> {
        return this.prisma.librarian.findUnique({
            where: { email }
        });
    }
}

// Singleton pattern para reutilização da instância
const authRepository = new AuthRepository();
export default authRepository;
