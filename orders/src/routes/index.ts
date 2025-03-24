import express, { Request, Response, Router } from 'express';
import { requireAuth, requireRole, UserRole } from '@smartdine/common';
import { Order } from '../models/order';

const router: Router = express.Router();

router.get(
  '/api/orders', 
  requireAuth,
  requireRole([UserRole.CUSTOMER]),
  async (req: Request, res: Response) => {
    const orders = await Order.find({
      userId: req.currentUser!.id
    }).populate('items');

    res.send(orders);
  }
);

export { router as indexOrderRouter };

export * from './delete';
export * from './new';
export * from './show';
export * from './index-route';
