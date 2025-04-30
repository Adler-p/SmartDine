import express, { Request, Response, Router, NextFunction } from 'express';
// 直接require，避免类型冲突
const { currentUser } = require('@smartdine/common');
import { redis } from '../redis-client';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

// 创建一个中间件来从 cookie 中提取 JWT
const extractJwtFromCookie = (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      try {
        acc[key] = JSON.parse(decodeURIComponent(value));
      } catch {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, any>) || {};

    // 检查 session cookie
    if (cookies.session && cookies.session.jwt) {
      // 将 JWT 添加到 req.session
      req.session = { jwt: cookies.session.jwt };
    }
    
    console.log('Extracted cookies:', cookies);
    console.log('Set session to:', req.session);
  } catch (err) {
    console.error('Error extracting JWT from cookies:', err);
  }
  
  next();
};

router.get('/api/users/currentuser', extractJwtFromCookie, currentUser(redis), (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
