import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LibrarianRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
    librarian?: {
        librarianId: string;
        email: string;
        role: LibrarianRole;
    };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        res.status(401).json({ message: 'Acesso não autorizado. Token não fornecido.' });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('ERRO FATAL NO MIDDLEWARE: JWT_SECRET não está definido no .env');
        res.status(500).json({ message: 'Erro de configuração interna do servidor (segredo JWT ausente no middleware).' });
        return;
    }

    jwt.verify(token, jwtSecret, (err: any, decodedPayload: any) => {
        if (err) {
            console.error("Erro na verificação do token:", err.message);
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
                return;
            }
            res.status(403).json({ message: 'Token inválido ou malformado.' });
            return;
        }

        req.librarian = decodedPayload as AuthenticatedRequest['librarian'];

        next();
    });
};

export const authorizeRoles = (...allowedRoles: LibrarianRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.librarian || !req.librarian.role) {
            res.status(403).json({ message: 'Acesso negado. Role não identificado.' });
            return;
        }

        if (!allowedRoles.includes(req.librarian.role)) {
            res.status(403).json({
                message: `Acesso negado. Seu role ('${req.librarian.role}') não tem permissão para este recurso.`
            });
            return;
        }
        next();
    };
};
