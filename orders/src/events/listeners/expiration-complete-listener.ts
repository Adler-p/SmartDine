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

    // // If order is already complete or cancelled, just ack the message
    // If order is still in CREATED status (still pending payment), we will cancel it
    if (order.orderStatus === OrderStatus.CREATED) {
      // Update order status to cancelled
      order.orderStatus = OrderStatus.CANCELLED;
      await order.save();

      // Publish an event saying this order was cancelled -> to cancel payment 
      await new OrderCancelledPublisher(natsWrapper.client).publish({
        orderId: order.orderId
      });

      msg.ack();
      return;
    }

    // For all other order statuses -> just acknowledge the message
    msg.ack();
  }
} 