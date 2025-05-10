import type { Book } from './Book';

export class Publisher {
    constructor(
        public id: string,
        public name: string,
        public address?: string,
        public contactInfo?: string,
        public books?: Book[]
    ) { }
}