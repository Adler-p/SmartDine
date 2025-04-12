import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCancelledEvent, OrderStatus } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    try {
      const order = await Order.findByEvent({
        id: data.id,
        version: data.version,
      });

      if (!order) {
        console.log(`Order ${data.id} not found, skipping cancellation`);
        msg.ack();
        return;
      }

      order.status = OrderStatus.Cancelled;
      await order.save();

      msg.ack();
    } catch (err) {
      console.error('Error processing order cancelled event:', err);
      // Acknowledge to avoid infinite reprocessing
      msg.ack();
    }
  }
} 