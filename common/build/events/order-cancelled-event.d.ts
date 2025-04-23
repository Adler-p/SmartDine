import { Subjects } from './subjects';
export interface OrderCancelledEvent {
    type: Subjects.OrderCancelled;
    subject: Subjects.OrderCancelled;
    data: {
        orderId: string;
    };
}
