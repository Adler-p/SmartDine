import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, UserRole, requireRole } from '@smartdine/common';
import { param } from 'express-validator';
import { Order } from '../../models/order';
import { OrderItem } from '../../models/orderItem';

const router = express.Router();

router.get(
  '/api/staff/orders/:orderId',
  requireAuth,
  requireRole([UserRole.STAFF]),
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
        return res.status(404).send({ errors: [{ message: 'Order not found' }] });
      }

      res.status(200).send(order);
      
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).send({ errors: [{ message: 'Failed to fetch order' }] });
    }
  }
);

export { router as staffViewOrderRouter };