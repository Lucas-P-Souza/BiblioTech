import { Router } from 'express';
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

const librarianRouter = Router();

// Rotas gerais /librarians
librarianRouter.get('/', getAllLibrarians);      // Listar todos
librarianRouter.post('/', createLibrarian);     // Criar novo
librarianRouter.delete('/', deleteAllLibrarians); // Deletar todos (CUIDADO!)

// Rotas por ID (UUID) específico
librarianRouter.get('/id/:id', getLibrarianById);
librarianRouter.put('/id/:id', updateLibrarianById);
librarianRouter.delete('/id/:id', deleteLibrarianById);

// Rotas por Employee ID específico
librarianRouter.get('/employee/:employeeId', getLibrarianByEmployeeId);
librarianRouter.put('/employee/:employeeId', updateLibrarianByEmployeeId);
librarianRouter.delete('/employee/:employeeId', deleteLibrarianByEmployeeId);

export default librarianRouter;