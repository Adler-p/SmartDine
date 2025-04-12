import { Subjects } from './subjects';

export interface OrderCancelledEvent {
  type: Subjects.OrderCancelled;
  subject: Subjects.OrderCancelled;
  data: {
    id: string;
    version: number;
    items: {
      menuItemId: string;
      name?: string;
      price?: number;
      quantity?: number;
    }[];
  };
}
