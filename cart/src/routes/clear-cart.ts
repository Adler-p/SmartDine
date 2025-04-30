import express, { Request, Response } from 'express';
import { redis } from '../redis-client';
import { validateSession } from '@smartdine/common';
import { CartUpdatedPublisher } from '../events/publishers/cart-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/cart/clear', 
    // validateSession(redis), 
async (req: Request, res: Response) => {

    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).send({ error: 'Session ID is required from request body' });
    }
    // const sessionId = req.session.sessionId;
    
    try {
        // 1. Retrieve existing session data from Redis
        const existingSessionDataString = await redis.get(`session:${sessionId}`);

        if (!existingSessionDataString) {
            return res.status(404).send({ error: 'Session not found' });
        }

        const existingSessionData = JSON.parse(existingSessionDataString);

        // 2. Clear the cart by setting it to an empty array
        existingSessionData.cart = [];

        // 3. Update Redis with the cleared cart and reset expiration
        await redis.set(`session:${sessionId}`, JSON.stringify(existingSessionData), 'EX', 15 * 60); // 15 minutes in seconds

        // 4. Publish CartUpdatedEvent for an empty cart
        await new CartUpdatedPublisher(natsWrapper.client).publish({
            sessionId: sessionId,
            items: [],
            totalItems: 0,
            totalPrice: 0,
        });

        res.status(200).send({ message: 'Cart cleared', cart: existingSessionData.cart });

    } catch (error) {
        console.error('Error clearing cart:', error);
        return res.status(500).send({ error: 'Failed to clear cart' });
    }
});

export { router as clearCartRouter };