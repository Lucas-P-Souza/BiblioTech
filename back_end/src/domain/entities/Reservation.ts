import { ReservationStatus } from '../enums/ReservationStatus';
import type { User } from './User';
import type { Book } from './Book';

export class Reservation {
    constructor(
        public id: string,
        public userId: string, // ID do Usuário
        public bookId: string, // ID do Livro (título)
        public reservationDate: Date,
        public status: ReservationStatus,
        public notificationSent?: boolean,
        public availableUntil?: Date,
        public user?: User,
        public book?: Book
    ) { }
}