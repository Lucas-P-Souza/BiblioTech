import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import authorRouter from './routes/author.routes';
import categoryRouter from './routes/category.routes';
import publisherRouter from './routes/publisher.routes';
import bookRouter from './routes/book.routes'; // <--- ADICIONE ESTA LINHA

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('API BiblioTech Rodando! Bem-vindo! 🎉');
});

// ---- Nossas Rotas da API ----
app.use('/authors', authorRouter);
app.use('/categories', categoryRouter);
app.use('/publishers', publisherRouter);
app.use('/books', bookRouter); // <--- ADICIONE ESTA LINHA

// TODO: Adicionar os routers para as outras entidades aqui

app.listen(PORT, () => {
    console.log(`🚀 Servidor BiblioTech decolou na porta ${PORT}`);
    console.log(`Brota em http://localhost:${PORT}`);
});

const shutdownGracefully = async (signal: string) => {
    console.log(`\nSinal ${signal} recebido. Desligando elegantemente...`);
    await prisma.$disconnect();
    console.log('Prisma Client desconectado.');
    process.exit(0);
};
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));