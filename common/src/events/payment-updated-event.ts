import { Subjects } from './subjects';

export interface PaymentUpdatedEvent {
  subject: Subjects.PaymentUpdated;
  type: Subjects.PaymentUpdated;
  data: {
    id: string;
    orderId: string;
    status: string;
    amount: number;
    userId: string;
    version: number;
  };
} 