import express, { Request, Response } from 'express';
import { redis } from '../redis-client';
import { validateSession } from '@smartdine/common';

const router = express.Router();

router.get('/api/cart', validateSession(redis), async (req: Request, res: Response) => {
    if (!req.sessionData) {
        return res.status(400).send({ error: 'Session data is missing' });
    }
    const sessionData = req.sessionData;

    res.status(200).send({ cart: sessionData.cart || [] });
})

export { router as viewCartRouter };