import { Subjects } from './subjects';
export interface CartUpdatedEvent {
    type: Subjects.CartUpdated;
    data: {
        sessionId: string;
        items: Array<{
            itemId: string;
            name: string;
            price: number;
            quantity: number;
        }>;
        totalItems: number;
        totalPrice: number;
    };
}
