import express, { Request, Response, Router } from 'express';
// 直接require，避免类型冲突
const { currentUser } = require('@smartdine/common');
import { redis } from '../redis-client';

const router: Router = express.Router();

router.get('/api/users/currentuser', currentUser(redis), (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
