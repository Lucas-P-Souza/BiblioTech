import { FineStatus } from '../enums/FineStatus';
import type { Loan } from './Loan';

export class Fine {
    constructor(
        public id: string,
        public loanId: string, // ID do Empréstimo
        public amount: number,
        public issueDate: Date,
        public status: FineStatus,
        public paymentDate?: Date,
        public loan?: Loan
    ) { }
}