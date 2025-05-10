import { BookItemStatus } from '../enums/BookItemStatus';
import type { Book } from './Book';
import type { Loan } from './Loan';

export class BookItem {
    constructor(
        public id: string,
        public bookId: string, // ID do Livro (título)
        public barcode: string,
        public status: BookItemStatus,
        public acquisitionDate: Date,
        public book?: Book,
        public loan?: Loan
    ) { }
}