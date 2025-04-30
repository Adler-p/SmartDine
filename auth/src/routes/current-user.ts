import express, { Request, Response, Router, NextFunction } from 'express';
// 直接require，避免类型冲突
const { currentUser } = require('@smartdine/common');
import { redis } from '../redis-client';

const router: Router = express.Router();

// 创建一个中间件来从 cookie 中提取 JWT
// const extractJwtFromCookie = (req: Request, res: Response, next: NextFunction) => {
//   const cookies = req.cookies;
//   if (cookies.session) {
//     req.session = { jwt: cookies.session };
//   }
// 
//   console.log('Extracted cookies:', cookies);
//   console.log('Set session to:', req.session);
// 
// 
//   next();
// };

router.get('/api/users/currentuser', currentUser(redis), (req: Request, res: Response) => {
  console.log('Current user request received.');
  console.log('Cookies:', req.cookies);
  console.log('Session:', req.session);
  console.log('CurrentUser payload:', req.currentUser);
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
