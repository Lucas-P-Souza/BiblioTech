import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { convertTimeToSeconds } from '../utils/time.utils';

const prisma = new PrismaClient();

// Realiza a autenticação do bibliotecário e gera token JWT
// Verifica credenciais e retorna informações necessárias para a sessão
export const loginLibrarian = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email e senha são obrigatórios para o login.' });
            return;
        }

        const librarian = await prisma.librarian.findUnique({
            where: { email },
        });

        if (!librarian) {
            res.status(401).json({ message: 'Credenciais inválidas.' });
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, librarian.passwordHash);

        if (!isPasswordCorrect) {
            res.status(401).json({ message: 'Credenciais inválidas.' });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET;
        const expiresInFromEnv = process.env.JWT_EXPIRES_IN || '1h';
        const expiresInSeconds = convertTimeToSeconds(expiresInFromEnv);

        if (!jwtSecret) {
            console.error('ALERTA DE SEGURANÇA: JWT_SECRET não está definido no arquivo .env!');
            res.status(500).json({ message: 'Erro de configuração interna do servidor (segredo JWT).' });
            return;
        }

        if (expiresInSeconds === undefined) {
            console.error(`ALERTA DE CONFIGURAÇÃO: Formato inválido para JWT_EXPIRES_IN: "${expiresInFromEnv}". Usando padrão de 1 hora (3600s).`);
            res.status(500).json({ message: `Formato de JWT_EXPIRES_IN ("${expiresInFromEnv}") inválido. Use formatos como "3600" (segundos), "1h", "7d".` });
            return;
        }

        const payload = {
            librarianId: librarian.id,
            email: librarian.email,
            role: librarian.role,
            name: librarian.name
        };

        const signOptions: jwt.SignOptions = {
            expiresIn: expiresInSeconds, // Agora é sempre um número (segundos)
        };

        const token = jwt.sign(payload, jwtSecret, signOptions);

        res.status(200).json({
            message: 'Login realizado com sucesso!',
            token,
            librarian: {
                id: librarian.id,
                name: librarian.name,
                email: librarian.email,
                role: librarian.role,
            },
        });

    } catch (error: unknown) {
        console.error("Erro no processo de login do bibliotecário:", error);
        res.status(500).json({ message: 'Erro interno no servidor durante o login.' });
    }
};
