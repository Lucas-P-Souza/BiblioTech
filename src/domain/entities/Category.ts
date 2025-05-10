import type { Book } from './Book';

export class Category {
    constructor(
        public id: string,
        public name: string,
        public description?: string,
        public books?: Book[]
    ) { }
}