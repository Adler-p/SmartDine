import { Subjects } from './subjects';
import { OrderStatus } from './types/order-status';

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
