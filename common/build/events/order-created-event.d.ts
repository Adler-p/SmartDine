import { Subjects } from './subjects';
import { OrderStatus } from './types/order-status';
export interface OrderCreatedEvent {
    type: Subjects.OrderCreated;
    subject: Subjects.OrderCreated;
    data: {
        id: string;
        version: number;
        status: OrderStatus;
        userId: string;
        expiresAt: string;
        items: {
            menuItemId: string;
            name?: string;
            price?: number;
            quantity?: number;
        }[];
    };
}
