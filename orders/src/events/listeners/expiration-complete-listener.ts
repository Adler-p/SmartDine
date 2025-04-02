import { Message } from 'node-nats-streaming';
import { Listener, ExpirationCompleteEvent, Subjects, OrderStatus } from '@smartdine/common';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = 'orders-service';

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.Completed) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();
    const menuItemId = order.items[0].menuItemId as string;
    const cancelEvent = {
      id: order.id,
      version: order.version,
      items: order.items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    await new OrderCancelledPublisher(natsWrapper.client).publish(cancelEvent);

    msg.ack();
  }
} 