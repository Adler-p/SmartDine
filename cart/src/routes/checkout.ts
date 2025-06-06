import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { redis } from '../redis-client';
import { validateSession, validateRequest } from '@smartdine/common';
import { CartFinalisedPublisher } from '../events/publishers/cart-finalised-publisher';
import { natsWrapper } from '../nats-wrapper';
import { CartItem } from '../models/cart-item';

const router = express.Router();
const orderIdPromises: { [key: string]: (orderId: string) => void } = {};

router.post(
    '/api/cart/checkout',
    // validateSession(redis),
    [
        body('tableId')
        .notEmpty()
        .withMessage('Table ID is required'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { sessionId, tableId } = req.body;
    
        if (!sessionId) {
            return res.status(400).send({ error: 'Session ID is required from request body' });
        }
        // const sessionId = req.session.sessionId;

        // Retrieve cart items from Redis using sessionId
        const sessionKey = `session:${sessionId}`;
        const sessionDataString = await redis.get(sessionKey);
        const sessionData = sessionDataString ? JSON.parse(sessionDataString) : {};
        const cartItems = sessionData.cart || [];

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).send({ error: 'Cart is empty' });
        }
    
        // Publish CartFinalisedEvent
        await new CartFinalisedPublisher(natsWrapper.client).publish({
            sessionId: sessionId,
            tableId: tableId,
            items: cartItems.map((cartItem: CartItem) => ({
                itemId: cartItem.itemId,
                itemName: cartItem.itemName,
                unitPrice: cartItem.unitPrice,
                quantity: cartItem.quantity,
            })),
        });

        // Await for orderId from order:created event
        const checkoutId = `${sessionId}_${tableId}`;
        // const orderIdPromise = new Promise<string>((resolve) => {
        //     orderIdPromises[checkoutId] = resolve;
        // });
    
        // const orderId = await Promise.race([
        //     orderIdPromise,
        //     new Promise((_, reject) => setTimeout(() => reject(new Error('Order creation timeout')), 30000))
        // ]);

        // Clear the cart in Redis
        await redis.del(`session:${sessionId}`);
        res.status(200).send({ message: 'Checkout successful', checkoutId, items: cartItems });
    
    }
)
export { router as checkoutCartRouter };