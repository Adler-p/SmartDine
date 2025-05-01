import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, UserRole, requireRole, OrderStatus } from '@smartdine/common';
import { query, body } from 'express-validator';
import { Order } from '../../models/order';
import { OrderItem } from '../../models/orderItem';

const router = express.Router();

router.post(
  '/api/staff/orders',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    body('orderStatus')
      .optional()
      .isIn(Object.values(OrderStatus))
      .withMessage('Invalid order status'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderStatus } = req.body;
    const whereClause: any = {};

    if (orderStatus) {
      whereClause.orderStatus = orderStatus;
    }

    try {
      const orders = await Order.findAll({
        where: whereClause,
        include: [{ model: OrderItem, as: 'orderItems' }],
        order: [['createdAt', 'DESC']], // Latest orders first
      });

      res.status(200).send(orders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send({ errors: 'Failed to fetch orders' });
    }
  }
);

export { router as staffViewAllOrdersRouter };