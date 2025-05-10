import type { Book } from './Book';

export class Author {
    constructor(
        public id: string,
        public name: string,
        public biography?: string,
        public books?: Book[]
    ) { }
}