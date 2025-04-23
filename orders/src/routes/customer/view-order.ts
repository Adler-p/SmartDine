import express, { Request, Response } from 'express';
import { validateRequest, validateSession } from '@smartdine/common';
import { param } from 'express-validator';
import { Order } from '../../models/order';
import { OrderItem } from '../../models/orderItem';
import { redis } from '../../redis-client';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  validateSession(redis), 
  [
    param('orderId')
      .isUUID()
      .withMessage('Order ID must be a valid UUID'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    try {
      const order = await Order.findByPk(orderId, {
        include: [{ model: OrderItem, as: 'orderItems' }],
      });

      if (!order) {
        return res.status(404).send({ errors: 'Order not found' });
      }

      // Check if the order belongs to the current user (customer who confirmed cart)
      if (order.sessionId !== req.sessionData?.sessionId) {
        return res.status(403).send({ errors: 'Not authorized to view this order' });
      }

      res.status(200).send(order);

    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).send({ errors: 'Failed to fetch order' });
    }
  }
);

export { router as showOrderRouter };