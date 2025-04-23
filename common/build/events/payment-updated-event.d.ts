import { Subjects } from './subjects';
import { PaymentStatus } from './types/payment-status';
export interface PaymentUpdatedEvent {
    subject: Subjects.PaymentUpdated;
    type: Subjects.PaymentUpdated;
    data: {
        paymentId: string;
        orderId: string;
        amount: number;
        paymentStatus: PaymentStatus;
        version: number;
    };
}
