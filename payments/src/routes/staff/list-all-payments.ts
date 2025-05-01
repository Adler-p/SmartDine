import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, requireRole, UserRole } from '@smartdine/common';
import { Payment } from '../../models/payment';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  requireRole([UserRole.STAFF]),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
        const payments = await Payment.findAll(); 
        res.status(200).send(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).send({ error: 'Failed to fetch payments' });
    }
  }); 

  export { router as listAllPaymentsRouter };