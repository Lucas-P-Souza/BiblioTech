import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * Converte uma string de tempo para segundos
 * Aceita formatos como "1h", "7d", "30m", "3600s" ou número direto
 * @param timeStr String ou número representando o tempo
 * @return Número em segundos ou undefined se o formato for inválido
 */
const convertTimeToSeconds = (timeStr: string | number | undefined): number | undefined => {
    if (timeStr === undefined) return undefined;
    if (typeof timeStr === 'number') return timeStr; // Já é um número (segundos)

    if (typeof timeStr === 'string') {
        const lastChar = timeStr.slice(-1).toLowerCase();
        const amount = parseInt(timeStr.slice(0, -1), 10);

        if (isNaN(amount)) return undefined; // Não conseguiu parsear o número

        switch (lastChar) {
            case 's': // segundos
                return amount;
            case 'm': // minutos
                return amount * 60;
            case 'h': // horas
                return amount * 60 * 60;
            case 'd': // dias
                return amount * 60 * 60 * 24;
            default:
                // Se for um número puro como string (ex: "3600")
                if (!isNaN(parseInt(timeStr, 10)) && String(parseInt(timeStr, 10)) === timeStr) {
                    return parseInt(timeStr, 10);
                }
                return undefined; // Formato não reconhecido
        }
    }
    return undefined;
};

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
        // Pega do .env, ou usa "1h" como fallback
        const expiresInFromEnv = process.env.JWT_EXPIRES_IN || '1h';
        // Converte para segundos
        const expiresInSeconds = convertTimeToSeconds(expiresInFromEnv);

        if (!jwtSecret) {
            console.error('ALERTA DE SEGURANÇA: JWT_SECRET não está definido no arquivo .env!');
            res.status(500).json({ message: 'Erro de configuração interna do servidor (segredo JWT).' });
            return;
        }

        if (expiresInSeconds === undefined) {
            console.error(`ALERTA DE CONFIGURAÇÃO: Formato inválido para JWT_EXPIRES_IN: "${expiresInFromEnv}". Usando padrão de 1 hora (3600s).`);
            // Se a conversão falhar, pode usar um padrão ou lançar erro. Aqui usamos 3600s.
            // Ou poderia retornar um erro 500 para forçar a correção no .env
            // res.status(500).json({ message: 'Erro de configuração interna do servidor (expiração JWT).' });
            // return;
            // Por segurança, se a conversão falhar, não gere o token ou use um default muito curto.
            // Para este exemplo, vamos forçar um erro se não conseguir converter.
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
