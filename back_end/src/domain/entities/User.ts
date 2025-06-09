import type { Loan } from './Loan';
import type { Reservation } from './Reservation';
import type { Fine } from './Fine';

export class User {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public registrationDate: Date,
        public loans?: Loan[],
        public reservations?: Reservation[],
        public fines?: Fine[]
    ) { }
}