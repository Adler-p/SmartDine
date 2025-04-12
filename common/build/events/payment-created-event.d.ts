import { Subjects } from './subjects';
export interface PaymentCreatedEvent {
    subject: Subjects.PaymentCreated;
    type: Subjects.PaymentCreated;
    data: {
        id: string;
        orderId: string;
        amount: number;
        status: string;
        userId: string;
        version: number;
    };
}
