import { Message } from 'node-nats-streaming';
import { Listener, ExpirationCompleteEvent, OrderStatus, Subjects } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../sequelize';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    // Find the order that the expiration is for
    const order = await Order.findOne({
      where: { orderId: data.orderId }
    });

    if (!order) {
      console.log(`Order not found for ID: ${data.orderId}`);
      msg.ack();
      return;
    }

    // If order is already complete or cancelled, just ack the message
    if (order.orderStatus === OrderStatus.COMPLETED || 
        order.orderStatus === OrderStatus.CANCELLED) {
      msg.ack();
      return;
    }

    // Update order status to cancelled
    order.orderStatus = OrderStatus.CANCELLED;
    await order.save();

    // Publish an event saying this order was cancelled
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      orderId: order.orderId
    });

    msg.ack();
  }
} 