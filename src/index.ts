import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Porta do servidor: pega do .env ou usa 3000 como padrão
const PORT = process.env.PORT || 3000;

// Middleware pra entender JSON no corpo das requisições
app.use(express.json());

// Rota principal só pra testar se tá tudo no ar
app.get('/', (req: Request, res: Response) => {
    res.send('API BiblioTech Rodando! Bem-vindo! 🎉');
});

// TODO: Implementar as rotas das entidades aqui (Users, Books, etc.)

app.listen(PORT, () => {
    console.log(`🚀 Servidor BiblioTech decolou na porta ${PORT}`);
    console.log(`Brota em http://localhost:${PORT}`);
});

// Isso garante que o Prisma Client desconecte do banco antes do servidor morrer.
const shutdownGracefully = async (signal: string) => {
    console.log(`\nSinal ${signal} recebido. Desligando elegantemente...`);
    await prisma.$disconnect();
    console.log('Prisma Client desconectado.');
    process.exit(0);
};

// Ouve por sinais de interrupção (Ctrl+C)
process.on('SIGINT', () => shutdownGracefully('SIGINT'));

// Ouve por sinais de término (geralmente enviados por Docker, orquestradores, etc.)
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));