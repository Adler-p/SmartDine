import { Message } from 'node-nats-streaming';
import { Listener, PaymentUpdatedEvent, Subjects, OrderStatus, PaymentStatus } from '@smartdine/common';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class PaymentUpdatedListener extends Listener<PaymentUpdatedEvent> {
  readonly subject = Subjects.PaymentUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentUpdatedEvent['data'], msg: Message) {
    const { orderId, paymentStatus } = data;

    try {
        const order = await Order.findByPk(orderId);
        if (!order) {
        //   throw new Error('Order not found');
            console.log(`Order ${orderId} not found`);
            msg.ack();
            return;
        }

        if (paymentStatus === PaymentStatus.FAILED) {
            order.orderStatus = OrderStatus.CANCELLED;

            // Save with optimistic locking
            try {
                await order.save();
                console.log(`Order ${orderId} cancelled due to payment failure`);
                msg.ack();
            } catch (err) {
                if (err.name === 'SequelizeOptimisticLockError') {
                console.log(`Concurrency conflict: Order ${orderId} was updated before payment:updated event processed`);
                msg.ack();
                }
                else {
                console.error('Error saving order after payment:updated event:', err);
                msg.ack();
                }
            }
        } else if (paymentStatus === PaymentStatus.SUCCESSFUL) {
            order.orderStatus = OrderStatus.AWAITING_PREPARATION;

            // Save with optimistic locking
            try {
                await order.save();
                console.log(`Payment success, order ${orderId} is awaiting preparation`);
                msg.ack();
            } catch (err) {
                if (err.name === 'SequelizeOptimisticLockError') {
                    console.log(`Concurrency conflict: Order ${orderId} was updated before payment:updated event processed`);
                    msg.ack();
                }
                else {
                    console.error('Error saving order after payment:updated event:', err);
                    msg.ack();
                }
            }
        }

    } catch  (err) {
        console.error('Error handling payment:success event:', err);
        msg.ack();
    }
  }
}
