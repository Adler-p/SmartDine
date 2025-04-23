import { Subjects } from './subjects';
import { PaymentStatus } from './types/payment-status';

export interface PaymentSuccessEvent {
  subject: Subjects.PaymentSuccess;
  type: Subjects.PaymentSuccess;
  data: {
    paymentId: string;
    orderId: string;
    amount: number;
    paymentStatus: PaymentStatus;
    version: number;
  };
}
