import express, { Request, Response } from 'express';
import { redis } from '../redis-client';
import { validateSession } from '@smartdine/common';
import { CartUpdatedPublisher } from '../events/publishers/cart-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
import { CartItem } from '../models/cart-item';

const router = express.Router();

router.post('/api/cart/remove', validateSession(redis), async (req: Request, res: Response) => {
    const { itemId } = req.body;

    if (!itemId) {
        return res.status(400).send({ error: 'Item ID is required' });
    }
    if (!req.session.sessionId) {
        return res.status(400).send({ error: 'Session data is missing' });
    }
    const sessionId = req.session.sessionId;
    
    try {
        // 1. Retrieve existing session data from Redis
        const existingSessionDataString = await redis.get(`session:${sessionId}`);

        if (!existingSessionDataString) {
            return res.status(404).send({ error: 'Session not found' });
        }

        const existingSessionData = JSON.parse(existingSessionDataString);
        const cart = existingSessionData.cart || [];

        const initialCartLength = cart.length;

        // 2. Remove item from the existing cart
        const updatedCart = cart.filter((item: any) => item.itemId !== itemId);
        existingSessionData.cart = updatedCart;

        // 3. Update Redis with the modified cart and reset expiration
        await redis.set(`session:${sessionId}`, JSON.stringify(existingSessionData), 'EX', 15 * 60); // 15 minutes in seconds

        // 4. Publish CartUpdatedEvent if the cart changed
        if (updatedCart.length < initialCartLength) {
            const totalItems = updatedCart.reduce((sum: number, cartItem: CartItem) => sum + cartItem.quantity, 0);
            const totalPrice = updatedCart.reduce((sum: number, cartItem: CartItem) => sum + (cartItem.unitPrice * cartItem.quantity), 0);

            await new CartUpdatedPublisher(natsWrapper.client).publish({
                sessionId: sessionId,
                items: updatedCart.map((cartItem: CartItem) => ({
                    itemId: cartItem.itemId,
                    itemName: cartItem.itemName,
                    unitPrice: cartItem.unitPrice,
                    quantity: cartItem.quantity,
                })),
                totalItems,
                totalPrice,
            });
        }

        res.status(200).send({
            message: 'Item removed from cart',
            sessionId: sessionId,
            cart: updatedCart,
        });

    } catch (error) {
        console.error('Error removing item from cart:', error);
        return res.status(500).send({ error: 'Failed to remove item from cart' });
    }
})

export { router as removeItemRouter };