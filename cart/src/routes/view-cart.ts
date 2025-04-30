import express, { Request, Response } from 'express';
import { redis } from '../redis-client';
import { validateSession } from '@smartdine/common';

const router = express.Router();

router.get('/api/cart', 
    // validateSession(redis), 
async (req: Request, res: Response) => {

    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).send({ error: 'Session ID is required from request body' });
    }
    // const sessionId = req.session.sessionId;

    // Retrieve cart items from Redis using sessionId
    const sessionKey = `session:${sessionId}`;
    const sessionDataString = await redis.get(sessionKey);
    const sessionData = sessionDataString ? JSON.parse(sessionDataString) : {};
    const cartItems = sessionData.cart || [];

    res.status(200).send({ cart: cartItems });
})

export { router as viewCartRouter };