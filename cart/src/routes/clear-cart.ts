import express, { Request, Response } from 'express';
import { redis } from '../redis-client';
import { validateSession } from '@smartdine/common';
import { CartUpdatedPublisher } from '../events/publishers/cart-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/cart/clear', validateSession(redis), async (req: Request, res: Response) => {
    if (!req.session.sessionId) {
        return res.status(400).send({ error: 'Session data is missing' });
    }
    const sessionId = req.session.sessionId;
    const sessionData = req.session;

    // Clear the cart by setting it to an empty array
    sessionData.cart = [];

    // Update Redis & reset expiration
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 15 * 60); // 15 minutes in seconds

    // Publish CartUpdatedEvent for an empty cart
    await new CartUpdatedPublisher(natsWrapper.client).publish({
        sessionId: sessionId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
    });

    res.status(200).send({ message: 'Cart cleared', cart: sessionData.cart });
});

export { router as clearCartRouter };