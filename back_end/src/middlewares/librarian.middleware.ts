import { Response, NextFunction } from 'express';
import { LibrarianRole } from '@prisma/client';
import { AuthenticatedRequest, authenticateToken, authorizeRoles } from './auth.middleware';
import librarianRepository from '../repositories/librarian.repository';

// Verifica se é a primeira criação de bibliotecário (sem autenticação) ou exige Admin
export const checkIfFirstAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const anyLibrarianExists = await librarianRepository.exists();

        if (!anyLibrarianExists) {
            console.log('Middleware checkIfFirstAdmin: Nenhum bibliotecário existe, permitindo criação do primeiro.');
            next();
            return;
        } else {
            console.log('Middleware checkIfFirstAdmin: Bibliotecários já existem, aplicando autenticação/autorização de Admin.');
            authenticateToken(req, res, (authError?: any) => {
                if (authError) {
                    return next(authError);
                }
                authorizeRoles(LibrarianRole.Admin)(req, res, next);
            });
        }
    } catch (error) {
        console.error("Erro no middleware checkIfFirstAdmin:", error);
        res.status(500).json({ message: "Erro interno no servidor ao verificar permissões." });
    }
};
