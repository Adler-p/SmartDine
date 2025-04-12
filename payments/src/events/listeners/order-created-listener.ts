import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCreatedEvent } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    try {
      // Check if order exists
      const existingOrder = await Order.findById(data.id);
      
      if (existingOrder) {
        console.log(`Order ${data.id} already exists, skipping creation`);
        msg.ack();
        return;
      }
      
      // Calculate total from items
      const totalAmount = data.items.reduce((acc, item) => {
        return acc + (item.price || 0) * (item.quantity || 1);
      }, 0);

      const order = Order.build({
        id: data.id,
        version: data.version,
        userId: data.userId,
        status: data.status,
        amount: totalAmount,
      });
      await order.save();

      msg.ack();
    } catch (err) {
      console.error('Error processing order created event:', err);
      // Acknowledge to avoid infinite reprocessing
      msg.ack();
    }
  }
} 