import { Router, Request, Response, NextFunction } from 'express';
import {
    createLibrarian,
    getAllLibrarians,
    getLibrarianById,
    updateLibrarianById,
    deleteLibrarianById,
    deleteAllLibrarians,
    getLibrarianByEmployeeId,
    updateLibrarianByEmployeeId,
    deleteLibrarianByEmployeeId
} from '../controllers/librarian.controller';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { LibrarianRole, PrismaClient } from '@prisma/client';

const librarianRouter = Router();
const prisma = new PrismaClient(); // Instância para checar se há bibliotecários

// Middleware para verificar se é a criação do primeiro admin
const checkIfFirstAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const anyLibrarianExists = await prisma.librarian.findFirst();

        if (!anyLibrarianExists) {
            // Se NÃO existe nenhum bibliotecário, permite a criação sem token.
            // O controller createLibrarian forçará o role Admin para este primeiro.
            console.log('Middleware checkIfFirstAdmin: Nenhum bibliotecário existe, permitindo criação do primeiro.');
            next(); // Pula para o controller createLibrarian
            return;
        } else {
            // Se JÁ existem bibliotecários, aplica a autenticação e autorização normal de Admin.
            console.log('Middleware checkIfFirstAdmin: Bibliotecários já existem, aplicando autenticação/autorização de Admin.');
            // Encadear authenticateToken e depois authorizeRoles
            authenticateToken(req, res, (authError?: any) => {
                if (authError) {
                    // Se authenticateToken enviar uma resposta de erro, ele não chamará next.
                    // Se ele chamar next(authError), o erro será tratado pelo Express.
                    // Se chegou aqui com authError, é porque next(authError) foi chamado.
                    return next(authError);
                }
                // Se autenticado com sucesso, prossegue para authorizeRoles
                authorizeRoles(LibrarianRole.Admin)(req, res, next);
            });
        }
    } catch (error) {
        console.error("Erro no middleware checkIfFirstAdmin:", error);
        res.status(500).json({ message: "Erro interno no servidor ao verificar permissões." });
        // Não chamamos next(error) aqui porque já enviamos uma resposta.
    }
};

// POST /librarians -> Criar novo bibliotecário
// Se for o primeiro, não precisa de token e será Admin.
// Se não for o primeiro, precisa de token de Admin.
librarianRouter.post('/', checkIfFirstAdmin, createLibrarian);

// GET /librarians -> Listar todos (Requer Admin ou Manager)
librarianRouter.get(
    '/',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    getAllLibrarians
);

// GET /librarians/id/:id -> Buscar por ID (Requer Admin ou Manager)
librarianRouter.get(
    '/id/:id',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    getLibrarianById
);

// GET /librarians/employee/:employeeId -> Buscar por Employee ID (Requer Admin ou Manager)
librarianRouter.get(
    '/employee/:employeeId',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin, LibrarianRole.Manager),
    getLibrarianByEmployeeId
);

// PUT /librarians/id/:id -> Atualizar por ID (Requer Admin)
librarianRouter.put(
    '/id/:id',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    updateLibrarianById
);

// PUT /librarians/employee/:employeeId -> Atualizar por Employee ID (Requer Admin)
librarianRouter.put(
    '/employee/:employeeId',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    updateLibrarianByEmployeeId
);

// DELETE /librarians/id/:id -> Deletar por ID (Requer Admin)
librarianRouter.delete(
    '/id/:id',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    deleteLibrarianById
);

// DELETE /librarians/employee/:employeeId -> Deletar por Employee ID (Requer Admin)
librarianRouter.delete(
    '/employee/:employeeId',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    deleteLibrarianByEmployeeId
);

// DELETE /librarians -> Deletar TODOS os bibliotecários (Requer Admin)
librarianRouter.delete(
    '/',
    authenticateToken,
    authorizeRoles(LibrarianRole.Admin),
    deleteAllLibrarians
);

export default librarianRouter;
