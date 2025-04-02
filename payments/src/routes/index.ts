import express, { Request, Response } from 'express';
import { requireAuth, requireRole, UserRole } from '@smartdine/common';
import { Payment } from '../models/payment';

const router = express.Router();

router.get(
  '/api/payments',
  requireAuth,
  requireRole([UserRole.STAFF]),
  async (req: Request, res: Response) => {
    const payments = await Payment.find({});
    res.send(payments);
  }
);

export { router as indexPaymentRouter }; 