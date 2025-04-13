import { Subjects } from './subjects';
import { PaymentStatus } from './types/payment-status';
export interface PaymentFailedEvent {
    subject: Subjects.PaymentFailed;
    type: Subjects.PaymentFailed;
    data: {
        paymentId: string;
        orderId: string;
        amount: number;
        paymentStatus: PaymentStatus;
        version: number;
    };
}
