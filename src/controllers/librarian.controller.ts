import { Request, Response } from 'express';
// Tentando importar LibrarianRole diretamente, assumindo Prisma generate OK
import { PrismaClient, LibrarianRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// --- CRIAR um novo bibliotecário ---
export const createLibrarian = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, employeeId, password, role } = req.body;

        if (!name || !email || !employeeId || !password) {
            res.status(400).json({ message: 'Nome, email, ID de funcionário e senha são obrigatórios.' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ message: 'A senha precisa ter no mínimo 6 caracteres.' });
            return;
        }

        let validRole: LibrarianRole = LibrarianRole.Staff; // Default
        if (role) {
            if (Object.values(LibrarianRole).includes(role as LibrarianRole)) {
                validRole = role as LibrarianRole;
            } else {
                res.status(400).json({ message: `Role inválido. Valores permitidos: ${Object.values(LibrarianRole).join(', ')}` });
                return;
            }
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const passwordHash = await bcrypt.hash(password, salt);

        const newLibrarian = await prisma.librarian.create({
            data: { name, email, employeeId, passwordHash, role: validRole },
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        res.status(201).json(newLibrarian);
    } catch (error: unknown) {
        console.error("Erro ao criar bibliotecário:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            res.status(409).json({ message: 'Email ou ID de funcionário já cadastrado.' });
            return;
        }
        res.status(500).json({ message: 'Erro interno ao criar bibliotecário.' });
    }
};

// --- LISTAR todos os bibliotecários ---
export const getAllLibrarians = async (req: Request, res: Response): Promise<void> => {
    try {
        const librarians = await prisma.librarian.findMany({
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        res.status(200).json(librarians);
    } catch (error: unknown) {
        console.error("Erro ao listar bibliotecários:", error);
        res.status(500).json({ message: 'Erro interno ao buscar bibliotecários.' });
    }
};

// --- BUSCAR um bibliotecário pelo ID (UUID) ---
export const getLibrarianById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const librarian = await prisma.librarian.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        if (!librarian) {
            res.status(404).json({ message: 'Bibliotecário não encontrado (por ID).' });
            return;
        }
        res.status(200).json(librarian);
    } catch (error: unknown) {
        console.error(`Erro ao buscar bibliotecário com ID ${id}:`, error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// --- BUSCAR um bibliotecário pelo EMPLOYEE_ID ---
export const getLibrarianByEmployeeId = async (req: Request, res: Response): Promise<void> => {
    const { employeeId } = req.params;
    try {
        const librarian = await prisma.librarian.findUnique({
            where: { employeeId },
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        if (!librarian) {
            res.status(404).json({ message: 'Bibliotecário não encontrado (por Employee ID).' });
            return;
        }
        res.status(200).json(librarian);
    } catch (error: unknown) {
        console.error(`Erro ao buscar bibliotecário com Employee ID ${employeeId}:`, error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// --- ATUALIZAR um bibliotecário pelo ID (UUID) ---
export const updateLibrarianById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, email, employeeId, password, role } = req.body;

    if (name === undefined && email === undefined && employeeId === undefined && password === undefined && role === undefined) {
        res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; email?: string; employeeId?: string; passwordHash?: string; role?: LibrarianRole; } = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (email !== undefined) dataToUpdate.email = email;
        if (employeeId !== undefined) dataToUpdate.employeeId = employeeId;
        if (role !== undefined) {
            if (Object.values(LibrarianRole).includes(role as LibrarianRole)) {
                dataToUpdate.role = role as LibrarianRole;
            } else if (role) {
                res.status(400).json({ message: `Role inválido. Permitidos: ${Object.values(LibrarianRole).join(', ')}` }); return;
            }
        }
        if (password) {
            if (password.length < 6) { res.status(400).json({ message: 'Nova senha curta demais.' }); return; }
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            dataToUpdate.passwordHash = await bcrypt.hash(password, salt);
        }

        const updatedLibrarian = await prisma.librarian.update({
            where: { id }, data: dataToUpdate,
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        res.status(200).json(updatedLibrarian);
    } catch (error: unknown) {
        console.error(`Erro ao atualizar bibliotecário ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Bibliotecário não encontrado (ID).' }); return; }
            if (error.code === 'P2002') { res.status(409).json({ message: 'Email ou Employee ID já em uso.' }); return; }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar.' });
    }
};

// --- ATUALIZAR um bibliotecário pelo EMPLOYEE_ID ---
export const updateLibrarianByEmployeeId = async (req: Request, res: Response): Promise<void> => {
    const { employeeId: employeeIdParam } = req.params;
    const { name, email, employeeId: newEmployeeId, password, role } = req.body;

    if (name === undefined && email === undefined && newEmployeeId === undefined && password === undefined && role === undefined) {
        res.status(400).json({ message: 'Nenhum dado para atualização.' }); return;
    }

    try {
        const dataToUpdate: { name?: string; email?: string; employeeId?: string; passwordHash?: string; role?: LibrarianRole; } = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (email !== undefined) dataToUpdate.email = email;
        if (newEmployeeId !== undefined) dataToUpdate.employeeId = newEmployeeId;
        if (role !== undefined) {
            if (Object.values(LibrarianRole).includes(role as LibrarianRole)) {
                dataToUpdate.role = role as LibrarianRole;
            } else if (role) {
                res.status(400).json({ message: `Role inválido. Permitidos: ${Object.values(LibrarianRole).join(', ')}` }); return;
            }
        }
        if (password) {
            if (password.length < 6) { res.status(400).json({ message: 'Nova senha curta demais.' }); return; }
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            dataToUpdate.passwordHash = await bcrypt.hash(password, salt);
        }

        const updatedLibrarian = await prisma.librarian.update({
            where: { employeeId: employeeIdParam }, data: dataToUpdate,
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        res.status(200).json(updatedLibrarian);
    } catch (error: unknown) {
        console.error(`Erro ao atualizar bibliotecário Employee ID ${employeeIdParam}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Bibliotecário não encontrado (Employee ID).' }); return; }
            if (error.code === 'P2002') { res.status(409).json({ message: 'Novo email ou Employee ID já em uso.' }); return; }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar.' });
    }
};

// --- DELETAR um bibliotecário pelo ID (UUID) ---
export const deleteLibrarianById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.librarian.delete({ where: { id } });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Erro ao deletar bibliotecário ID ${id}:`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2025') {
            res.status(404).json({ message: 'Bibliotecário não encontrado (ID).' }); return;
        }
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// --- DELETAR um bibliotecário pelo EMPLOYEE_ID ---
export const deleteLibrarianByEmployeeId = async (req: Request, res: Response): Promise<void> => {
    const { employeeId } = req.params;
    try {
        const librarianExists = await prisma.librarian.findUnique({ where: { employeeId } });
        if (!librarianExists) {
            res.status(404).json({ message: 'Bibliotecário não encontrado (Employee ID).' });
            return;
        }
        await prisma.librarian.delete({ where: { employeeId } });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Erro ao deletar bibliotecário Employee ID ${employeeId}:`, error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// --- DELETAR TODOS os bibliotecários ---
export const deleteAllLibrarians = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteResult = await prisma.librarian.deleteMany({});
        res.status(200).json({ message: 'Todos bibliotecários deletados.', count: deleteResult.count });
    } catch (error: unknown) {
        console.error("Erro ao deletar todos os bibliotecários:", error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};