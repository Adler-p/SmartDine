import { Publisher, OrderCreatedEvent, Subjects } from '@smartdine/common';
import { Stan } from 'node-nats-streaming';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly type = Subjects.OrderCreated;

  constructor(client: Stan) {
    super(client);
  }

  publish(data: OrderCreatedEvent['data']): Promise<void> {
    return super.publish(data);
  }
}
