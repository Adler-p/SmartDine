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
    if (!req.sessionData) {
        return res.status(400).send({ error: 'Session data is missing' });
    }
    const sessionId = req.sessionData.sessionId;
    const sessionData = req.sessionData;

    const initialCartLength = sessionData.cart ? sessionData.cart.length : 0;
    sessionData.cart = (sessionData.cart || []).filter((item: any) => item.itemId !== itemId);

    // Update Redis & reset expiration 
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 15 * 60); // 15 minutes in seconds

    // Publish CartUpdatedEvent if the cart changed
    if ((sessionData.cart ? sessionData.cart.length : 0) < initialCartLength) {
        const totalItems = (sessionData.cart || []).reduce((sum: number, cartItem: CartItem) => sum + cartItem.quantity, 0);
        const totalPrice = (sessionData.cart || []).reduce((sum: number, cartItem: CartItem) => sum + (cartItem.unitPrice * cartItem.quantity), 0);

        await new CartUpdatedPublisher(natsWrapper.client).publish({
            sessionId: sessionId,
            items: (sessionData.cart || []).map((cartItem: CartItem) => ({
                itemId: cartItem.itemId,
                name: cartItem.itemName,
                price: cartItem.unitPrice,
                quantity: cartItem.quantity,
            })),
            totalItems,
            totalPrice,
        });
    }

    res.status(200).send({ 
        message: 'Item removed from cart', 
        sessionId:sessionId, 
        cart: sessionData.cart 

    });
})

export { router as removeItemRouter };