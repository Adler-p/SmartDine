import { Subjects } from './subjects';
import { PaymentStatus } from './types/payment-status';

export interface PaymentCreatedEvent {
  subject: Subjects.PaymentCreated;
  type: Subjects.PaymentCreated;
  data: {
    paymentId: string;
    orderId: string;
    amount: number;
    paymentStatus: PaymentStatus;
    version: number;
  };
}
