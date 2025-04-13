import express, { Request, Response } from 'express';
import { currentUser, requireAuth, validateRequest, UserRole, requireRole, OrderStatus } from '@smartdine/common';
import { param, body } from 'express-validator';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

const router = express.Router();

router.patch(
  '/api/staff/orders/:orderId/status',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    param('orderId')
      .isUUID()
      .withMessage('Order ID must be a valid UUID'),
    body('orderStatus')
      .isIn(Object.values(OrderStatus))
      .withMessage('Invalid order status'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        return res.status(404).send({ errors: 'Order not found' });
      }

      const previousVersion = order.version;
      const [updatedRows] = await Order.update(
        { orderStatus: orderStatus }, 
        { where: { orderId, version: previousVersion } }
      )
      if (updatedRows === 0) {
        return res.status(409).send({ errors: 'Order has been updated by another user, please refresh' });
      }

      const updatedOrder = await Order.findByPk(orderId);
      res.status(200).send(updatedOrder);

      // Publish event for cancelled orders 
      if (orderStatus === OrderStatus.CANCELLED) {
        await new OrderCancelledPublisher(natsWrapper.client).publish({ orderId });
      } 

    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).send({ errors: [{ message: 'Failed to update order status' }] });
    }
  }
);

export { router as updateOrderStatusRouter };