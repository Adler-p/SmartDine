import { Message } from 'node-nats-streaming';
import {
  Listener,
  PaymentCreatedEvent,
  Subjects,
  OrderStatus,
} from '@smartdine/common';
import { Order } from '../../models/order';
import { OrderCreatedPublisher } from '../publishers/order-created-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = 'orders-service';

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.AwaitingPreparation,
    });
    await order.save();

    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      items: order.items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });

    msg.ack();
  }
}
