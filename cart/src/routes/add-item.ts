import express, { Request, Response } from 'express';
import { redis } from '../redis-client';
import { validateSession } from '@smartdine/common';
import { CartUpdatedPublisher } from '../events/publishers/cart-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
import { CartItem } from '../models/cart-item';

const router: express.Router = express.Router();

router.post('/api/cart/add', 
    // validateSession(redis), 
async (req: Request, res: Response) => {
    const { sessionId, item } = req.body;

    if (!item) {
        return res.status(400).send({ error: 'Item is required' });
    }
    if (!sessionId) {
        return res.status(400).send({ error: 'Session ID is required' });
    }
    // const sessionId = req.session.sessionId;

    try {
        // 1. Retrieve existing session data from Redis
        const existingSessionDataString = await redis.get(`session:${sessionId}`);

        if (!existingSessionDataString) {
            return res.status(404).send({ error: 'Session not found' });
        }

        const existingSessionData = JSON.parse(existingSessionDataString);
        const cart = existingSessionData.cart || [];

        // 2. Add item to the existing cart
        const existingItemIndex = cart.findIndex((cartItem: any) => cartItem.itemId === item.itemId);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += item.quantity;
        } else {
            cart.push(item);
        }

        // 3. Update Redis with the modified cart and reset expiration
        existingSessionData.cart = cart;
        await redis.set(`session:${sessionId}`, JSON.stringify(existingSessionData), 'EX', 15 * 60); // 15 minutes in seconds

        // 4. Publish CartUpdatedEvent
        const totalItems = cart.reduce((sum: number, cartItem: CartItem) => sum + cartItem.quantity, 0);
        const totalPrice = cart.reduce((sum: number, cartItem: CartItem) => sum + (cartItem.unitPrice * cartItem.quantity), 0);

        await new CartUpdatedPublisher(natsWrapper.client).publish({
            sessionId: sessionId,
            items: cart.map((cartItem: CartItem) => ({
                itemId: cartItem.itemId,
                itemName: cartItem.itemName,
                unitPrice: cartItem.unitPrice,
                quantity: cartItem.quantity,
            })),
            totalItems,
            totalPrice,
        });

        res.status(200).send({
            message: 'Item added to cart',
            sessionId: sessionId,
            cart: cart,
        });

    } catch (error) {
        console.error('Error adding item to cart:', error);
        return res.status(500).send({ error: 'Failed to add item to cart' });
    }
})

export { router as addItemRouter };