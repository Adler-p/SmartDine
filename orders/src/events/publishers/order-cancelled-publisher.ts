import { Publisher, OrderCancelledEvent, Subjects } from '@smartdine/common';
import { Stan } from 'node-nats-streaming';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly type = Subjects.OrderCancelled;

  constructor(client: Stan) {
    super(client);
  }

  publish(data: OrderCancelledEvent['data']): Promise<void> {
    return super.publish(data);
  }
}
