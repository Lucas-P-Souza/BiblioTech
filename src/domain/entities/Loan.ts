import { LoanStatus } from '../enums/LoanStatus';
import type { BookItem } from './BookItem';
import type { User } from './User';
import type { Fine } from './Fine';

export class Loan {
    constructor(
        public id: string,
        public bookItemId: string, // ID do Exemplar do Livro
        public userId: string,     // ID do Usuário
        public loanDate: Date,
        public dueDate: Date,
        public status: LoanStatus,
        public returnDate?: Date,
        public bookItem?: BookItem,
        public user?: User,
        public fine?: Fine
    ) { }
}