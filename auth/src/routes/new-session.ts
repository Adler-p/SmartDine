import express, { Request, Response } from 'express';
import { redis } from '../redis-client';
import { v4 as uuidv4 } from 'uuid';
import { SessionCreatedPublisher } from '../events/publishers/session-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.get('/api/session/create', async (req: Request, res: Response) => {
    const { role, tableId } = req.query;

    if (!role || !tableId) {
        return res.status(400).send({ error: 'Role and tableId are required' });
    }

    // Generate unique session ID to identify table customers 
    const sessionId = uuidv4();

    // Store session data in Redis with 15-minute expiration
    const sessionData = {
        role,
        tableId, 
        cart: []
    };

    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 15 * 60); // 15 minutes in seconds

    // Set the session ID in the cookie
    req.session = { sessionId };

    // Publish session:created event
    await new SessionCreatedPublisher(natsWrapper.client).publish({
        sessionId,
        role: role as string,
        tableId: tableId as string
    });

    // Redirect user back to frontend with session ID as query parameter 
    const frontendUrl = `http://smartdine.com/menu?tableId=${tableId}&sessionId=${sessionId}`;
    res.redirect(frontendUrl);
}); 

export { router as sessionRouter };