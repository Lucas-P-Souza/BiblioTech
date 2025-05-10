import type { Author } from './Author';
import type { Category } from './Category';
import type { Publisher } from './Publisher';
import type { BookItem } from './BookItem';

export class Book {
    constructor(
        public id: string,
        public title: string,
        public isbn: string,
        public publicationYear: number,
        public publisherId?: string, // ID da Editora
        public authors?: Author[],
        public categories?: Category[],
        public publisher?: Publisher,
        public items?: BookItem[]
    ) { }
}