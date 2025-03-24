import express, { Request, Response, Router } from 'express';
import { requireAuth, requireRole, UserRole } from '@smartdine/common';
import { Order } from '../../models/order';

const router: Router = express.Router();

router.get('/api/orders/staff', requireAuth, requireRole([UserRole.STAFF]), async (req: Request, res: Response) => {
  const orders = await Order.find().populate('items');
  res.send(orders);
});

export { router as staffOrderRouter }; 