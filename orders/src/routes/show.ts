import express, { Request, Response, Router } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  requireRole,
  UserRole
} from '@smartdine/common';
import { Order } from '../models/order';

const router: Router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  requireRole([UserRole.CUSTOMER, UserRole.STAFF]),
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      throw new NotFoundError();
    }

    // If user is customer, check if order belongs to them
    // Staff can view all orders
    if (req.currentUser!.role === UserRole.CUSTOMER && order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
