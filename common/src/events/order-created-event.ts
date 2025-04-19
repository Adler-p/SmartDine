import { Subjects } from './subjects';
import { OrderStatus } from './types/order-status';

export interface OrderCreatedEvent {
  type: Subjects.OrderCreated;
  subject: Subjects.OrderCreated;
  data: {
    orderId: string;
    sessionId: string;
    tableId: string;
    version: number;
    orderStatus: OrderStatus;
    totalAmount: number;
    createdAt: string;
    items: {
      itemId: string;
      itemName?: string;
      unitPrice?: number;
      quantity?: number;
    }[];
  };
}
