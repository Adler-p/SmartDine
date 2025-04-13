import { OrderStatus } from '@smartdine/common';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { Op } from 'sequelize';

async function checkAndCancelExpiredOrders() {
  try {
    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

    const expiredOrders = await Order.findAll({
      where: {
        orderStatus: OrderStatus.CREATED,
        createdAt: { [Op.lt]: cutoffTime }
      },
    });

    for (const order of expiredOrders) {
      order.orderStatus = OrderStatus.CANCELLED;
      await order.save();

      // Publish 'order:cancelled' event 
      await new OrderCancelledPublisher(natsWrapper.client).publish({
        orderId: order.orderId
      });
    }
  } catch (error) {
    console.error('Error checking and cancelling expired orders:', error);
  }
}

export { checkAndCancelExpiredOrders };