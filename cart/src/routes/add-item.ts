import express, { Request, Response } from 'express';
import { redis } from '../redis-client';
import { validateSession } from '@smartdine/common';
import { CartUpdatedPublisher } from '../events/publishers/cart-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
import { CartItem } from '../models/cart-item';

const router: express.Router = express.Router();

router.post('/api/cart/add', validateSession(redis), async (req: Request, res: Response) => {
    const { item } = req.body;

    if (!item) {
        return res.status(400).send({ error: 'Item is required' });
    }
    if (!req.sessionData) {
        return res.status(400).send({ error: 'Session data is missing' });
    }
    const sessionId = req.sessionData.sessionId;
    const sessionData = req.sessionData;

    // Add item to cart 
    sessionData.cart = sessionData.cart || [];
    
    const existingItemIndex = sessionData.cart.findIndex((cartItem: any) => cartItem.itemId === item.itemId);
    if (existingItemIndex > -1) {
        sessionData.cart[existingItemIndex].quantity += item.quantity;
    } else {
        sessionData.cart.push(item);
    }

    // Update Redis & reset expiration 
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 15 * 60); // 15 minutes in seconds

    // Publish CartUpdatedEvent
    const totalItems = sessionData.cart.reduce((sum: number, cartItem: CartItem) => sum + cartItem.quantity, 0);
    const totalPrice = sessionData.cart.reduce((sum: number, cartItem: CartItem) => sum + (cartItem.unitPrice * cartItem.quantity), 0);

    await new CartUpdatedPublisher(natsWrapper.client).publish({
        sessionId: sessionId,
        items: sessionData.cart.map((cartItem: CartItem) => ({
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
        cart: sessionData.cart 
    });
})

export { router as addItemRouter };