import express, { Request, Response, Router } from 'express';
import { requireAuth, requireRole, UserRole, validateRequest } from '@smartdine/common';
import { body } from 'express-validator';
import { Order } from '../../models/order';
import { OrderCreatedPublisher } from '../../events/publishers/order-created-publisher';
import { natsWrapper } from '../../nats-wrapper';
import { OrderStatus } from '@smartdine/common';

const router: Router = express.Router();

const EXPIRATION_WINDOW_MINUTES = 15;

router.post(
  '/api/orders',
  requireAuth,
  requireRole([UserRole.CUSTOMER]),
  [
    body('items')
      .isArray()
      .withMessage('Items must be an array')
      .notEmpty()
      .withMessage('Must include at least one item'),
    body('items.*.menuItemId')
      .notEmpty()
      .withMessage('Menu item ID is required'),
    body('items.*.quantity')
      .isInt({ gt: 0 })
      .withMessage('Quantity must be greater than 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { items } = req.body;

    // Calculate expiration
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + EXPIRATION_WINDOW_MINUTES);

    // Calculate total amount
    const totalAmount = items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create order
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      items: items.map((item: any) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount
    });

    await order.save();

    // Publish order created event
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      items: order.items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter }; 