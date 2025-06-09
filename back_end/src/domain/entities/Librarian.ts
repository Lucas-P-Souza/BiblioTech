import { LibrarianRole } from '../enums/LibrarianRole';

export class Librarian {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public employeeId: string,
        public role: LibrarianRole,
        public passwordHash: string
    ) { }
}