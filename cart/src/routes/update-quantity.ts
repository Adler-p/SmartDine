import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { redis } from '../redis-client';
import { validateSession, validateRequest } from '@smartdine/common';
import { CartUpdatedPublisher } from '../events/publishers/cart-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
import { CartItem } from '../models/cart-item';

const router = express.Router();

router.post(
  '/api/cart/update-quantity',
  // validateSession(redis),
  [
    body('itemId')
      .notEmpty()
      .withMessage('Item ID is required'),
    body('quantity')
      .isInt({ gt: 0 })
      .withMessage('Quantity must be a positive integer'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { sessionId, itemId, quantity } = req.body;

    if (!sessionId) {
        return res.status(400).send({ error: 'Session ID is required from request body' });
    }
    // const sessionId = req.session.sessionId;

    // Retrieve cart items from Redis using sessionId
    const sessionKey = `session:${sessionId}`;
    const sessionDataString = await redis.get(sessionKey);
    const sessionData = sessionDataString ? JSON.parse(sessionDataString) : {};
    const cartItems = sessionData.cart || [];

    const itemIndex = cartItems.findIndex((cartItem: any) => cartItem.itemId === itemId);

    if (itemIndex === -1) {
        return res.status(404).send({ error: 'Item not found in cart' });
    }

    if (quantity === 0) {
        // Remove the item if quantity is set to zero
        cartItems.splice(itemIndex, 1);
    } else {
        // Update the quantity of the existing item
        cartItems[itemIndex].quantity = quantity;
    }

    // Update Redis & reset expiration
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 15 * 60 * 1000); // 15 minutes in seconds

    // Publish CartUpdatedEvent
    const totalItems = cartItems.reduce((sum: number, cartItem: CartItem) => sum + cartItem.quantity, 0);
    const totalPrice = cartItems.reduce((sum: number, cartItem: CartItem) => sum + (cartItem.unitPrice * cartItem.quantity), 0);

    await new CartUpdatedPublisher(natsWrapper.client).publish({
        sessionId: sessionId,
        items: cartItems.map((cartItem: CartItem) => ({
            itemId: cartItem.itemId,
            itemName: cartItem.itemName,
            unitPrice: cartItem.unitPrice,
            quantity: cartItem.quantity,
        })),
        totalItems,
        totalPrice,
    });

    res.status(200).send({ 
      message: 'Cart updated', 
      sessionId: sessionId,
      cart: cartItems 
    });
  }
);

export { router as updateCartQuantityRouter };