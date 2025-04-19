import { Subjects } from './subjects';

export interface OrderCancelledEvent {
  type: Subjects.OrderCancelled;
  subject: Subjects.OrderCancelled;
  data: {
    orderId: string;
    // version: number;
    // items: {
    //   itemId: string;
    //   itemName?: string;
    //   unitPrice?: number;
    //   quantity?: number;
    // }[];
  };
}
