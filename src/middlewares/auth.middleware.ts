import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LibrarianRole } from '@prisma/client'; // Assumindo que este import funciona após os ajustes do Prisma

// Estendendo a interface Request do Express para adicionar a propriedade 'librarian'
// Isso nos dá tipagem para req.librarian depois que o token é verificado
export interface AuthenticatedRequest extends Request {
    librarian?: { // O payload que colocamos no token
        librarianId: string;
        email: string;
        role: LibrarianRole; // Ou string, se o import direto do enum ainda der problema
        // name?: string; // Se você adicionou o nome ao payload
    };
}

// Middleware para verificar o token JWT
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Pega só a parte do token "Bearer TOKEN_AQUI"

    if (token == null) {
        // Se não há token, o acesso não é autorizado
        res.status(401).json({ message: 'Acesso não autorizado. Token não fornecido.' });
        return; // Sai da função middleware aqui
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('ERRO FATAL NO MIDDLEWARE: JWT_SECRET não está definido no .env');
        res.status(500).json({ message: 'Erro de configuração interna do servidor (segredo JWT ausente no middleware).' });
        return; // Sai da função middleware aqui
    }

    jwt.verify(token, jwtSecret, (err: any, decodedPayload: any) => {
        if (err) {
            // Se o token for inválido (expirado, assinatura errada, etc.)
            console.error("Erro na verificação do token:", err.message);
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
                return; // Sai da função middleware aqui
            }
            res.status(403).json({ message: 'Token inválido ou malformado.' }); // 403 Forbidden
            return; // Sai da função middleware aqui
        }

        // Se o token for válido, o 'decodedPayload' é o payload que você usou ao criar o token
        // Adicionamos ele ao objeto 'req' para que as rotas protegidas possam acessá-lo
        req.librarian = decodedPayload as AuthenticatedRequest['librarian'];

        next(); // Passa para a próxima função de middleware ou para o controller da rota
    });
};

// Middleware opcional para verificar roles (autorização)
export const authorizeRoles = (...allowedRoles: LibrarianRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.librarian || !req.librarian.role) {
            res.status(403).json({ message: 'Acesso negado. Role não identificado.' });
            return; // Sai da função
        }

        if (!allowedRoles.includes(req.librarian.role)) {
            res.status(403).json({
                message: `Acesso negado. Seu role ('${req.librarian.role}') não tem permissão para este recurso.`
            });
            return; // Sai da função
        }
        next(); // Usuário tem o role permitido, continua
    };
};
