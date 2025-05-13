import { Request, Response } from 'express';
import { PrismaClient, LibrarianRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Cria um novo bibliotecário
// O primeiro bibliotecário criado recebe automaticamente role Admin
// Para os demais, só um Admin pode criar novos bibliotecários
export const createLibrarian = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

        const anyLibrarianExists = await prisma.librarian.findFirst();
        let finalRole: LibrarianRole;

        if (!anyLibrarianExists) {
            finalRole = LibrarianRole.Admin;
            console.log('Primeiro bibliotecário sendo criado. Definindo role como Admin.');
        } else {
            // Se já existem bibliotecários, a rota DEVE ser protegida para que apenas um Admin crie outros.
            // A verificação de req.librarian.role === LibrarianRole.Admin é feita pelo middleware authorizeRoles na rota.
            // Aqui, apenas validamos o 'role' fornecido para o novo bibliotecário.
            let requestedRole: LibrarianRole = LibrarianRole.Staff; // Default se não especificado
            if (role) {
                if (Object.values(LibrarianRole).includes(role as LibrarianRole)) {
                    requestedRole = role as LibrarianRole;
                } else {
                    res.status(400).json({ message: `Role inválido. Valores permitidos: ${Object.values(LibrarianRole).join(', ')}` });
                    return;
                }
            }
            finalRole = requestedRole;
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const passwordHash = await bcrypt.hash(password, salt);

        const newLibrarian = await prisma.librarian.create({
            data: { name, email, employeeId, passwordHash, role: finalRole },
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        res.status(201).json(newLibrarian);
    } catch (error: unknown) {
        console.error("Controller Error - createLibrarian:", error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2002') {
            res.status(409).json({ message: 'Conflito: Email ou ID de funcionário já cadastrado.' });
            return;
        }
        res.status(500).json({ message: 'Erro interno ao criar bibliotecário.' });
    }
};

// Lista todos os bibliotecários cadastrados
// Acesso restrito a Admin e Manager
export const getAllLibrarians = async (req: Request, res: Response): Promise<void> => {
    try {
        const librarians = await prisma.librarian.findMany({
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        res.status(200).json(librarians);
    } catch (error: unknown) {
        console.error("Controller Error - getAllLibrarians:", error);
        res.status(500).json({ message: 'Erro interno ao buscar bibliotecários.' });
    }
};

// Busca um bibliotecário pelo ID (UUID)
// Acesso restrito a Admin e Manager
export const getLibrarianById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const librarian = await prisma.librarian.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        if (!librarian) {
            res.status(404).json({ message: 'Bibliotecário não encontrado (ID).' });
            return;
        }
        res.status(200).json(librarian);
    } catch (error: unknown) {
        console.error(`Controller Error - getLibrarianById (ID: ${id}):`, error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// Busca um bibliotecário pelo número de identificação funcional
// Acesso restrito a Admin e Manager
export const getLibrarianByEmployeeId = async (req: Request, res: Response): Promise<void> => {
    const { employeeId } = req.params;
    try {
        const librarian = await prisma.librarian.findUnique({
            where: { employeeId },
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        if (!librarian) {
            res.status(404).json({ message: 'Bibliotecário não encontrado (Employee ID).' });
            return;
        }
        res.status(200).json(librarian);
    } catch (error: unknown) {
        console.error(`Controller Error - getLibrarianByEmployeeId (EmployeeID: ${employeeId}):`, error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// Atualiza os dados de um bibliotecário pelo seu ID
// Acesso restrito a Admin
export const updateLibrarianById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id: targetLibrarianId } = req.params;
    const { name, email, employeeId, password, role } = req.body; // 'role' é o novo role a ser definido

    if (name === undefined && email === undefined && employeeId === undefined && password === undefined && role === undefined) {
        res.status(400).json({ message: 'Nenhum dado novo para atualizar.' });
        return;
    }

    try {
        const dataToUpdate: { name?: string; email?: string; employeeId?: string; passwordHash?: string; role?: LibrarianRole; } = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (email !== undefined) dataToUpdate.email = email;
        if (employeeId !== undefined) dataToUpdate.employeeId = employeeId;

        // Se um novo 'role' foi fornecido no corpo da requisição
        if (role !== undefined) {
            if (Object.values(LibrarianRole).includes(role as LibrarianRole)) {
                dataToUpdate.role = role as LibrarianRole;
            } else {
                // Se 'role' foi fornecido mas não é um valor válido do enum
                res.status(400).json({ message: `Role inválido. Valores permitidos: ${Object.values(LibrarianRole).join(', ')}` });
                return;
            }
        }

        if (password) {
            if (password.length < 6) { res.status(400).json({ message: 'Nova senha curta demais (mínimo 6 caracteres).' }); return; }
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            dataToUpdate.passwordHash = await bcrypt.hash(password, salt);
        }

        const updatedLibrarian = await prisma.librarian.update({
            where: { id: targetLibrarianId }, data: dataToUpdate,
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        res.status(200).json(updatedLibrarian);
    } catch (error: unknown) {
        console.error(`Controller Error - updateLibrarianById (ID: ${targetLibrarianId}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Bibliotecário não encontrado (ID).' }); return; }
            if (error.code === 'P2002') { res.status(409).json({ message: 'Conflito: Novo email ou Employee ID já está em uso.' }); return; }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar.' });
    }
};

// Atualiza os dados de um bibliotecário pelo seu número de identificação
// Acesso restrito a Admin
export const updateLibrarianByEmployeeId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { employeeId: paramEmployeeId } = req.params;
    const { name, email, employeeId: newEmployeeId, password, role } = req.body; // 'role' é o novo role

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
            } else {
                res.status(400).json({ message: `Role inválido. Valores permitidos: ${Object.values(LibrarianRole).join(', ')}` });
                return;
            }
        }

        if (password) {
            if (password.length < 6) { res.status(400).json({ message: 'Nova senha curta demais.' }); return; }
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            dataToUpdate.passwordHash = await bcrypt.hash(password, salt);
        }

        const updatedLibrarian = await prisma.librarian.update({
            where: { employeeId: paramEmployeeId }, data: dataToUpdate,
            select: { id: true, name: true, email: true, employeeId: true, role: true, createdAt: true, updatedAt: true }
        });
        res.status(200).json(updatedLibrarian);
    } catch (error: unknown) {
        console.error(`Controller Error - updateLibrarianByEmployeeId (EmployeeID: ${paramEmployeeId}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            if (error.code === 'P2025') { res.status(404).json({ message: 'Bibliotecário não encontrado (Employee ID).' }); return; }
            if (error.code === 'P2002') { res.status(409).json({ message: 'Conflito: Novo email ou Employee ID já está em uso.' }); return; }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar.' });
    }
};

// Remove um bibliotecário pelo seu ID
// Acesso restrito a Admin
export const deleteLibrarianById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.librarian.delete({ where: { id } });
        res.status(204).send();
    } catch (error: unknown) {
        console.error(`Controller Error - deleteLibrarianById (ID: ${id}):`, error);
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code === 'P2025') {
            res.status(404).json({ message: 'Bibliotecário não encontrado (ID).' }); return;
        }
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// Remove um bibliotecário pelo seu número de identificação
// Acesso restrito a Admin
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
        console.error(`Controller Error - deleteLibrarianByEmployeeId (EmployeeID: ${employeeId}):`, error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// Remove todos os bibliotecários do sistema
// Operação extremamente perigosa - acesso restrito a Admin
export const deleteAllLibrarians = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleteResult = await prisma.librarian.deleteMany({});
        res.status(200).json({ message: 'Todos bibliotecários deletados.', count: deleteResult.count });
    } catch (error: unknown) {
        console.error("Controller Error - deleteAllLibrarians:", error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};
