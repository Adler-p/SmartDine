import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/user-role';

interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (redisClient: any) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    return next();  // No token, proceed without attaching currentUser
  }

  try {
    // // Check if the token is blacklisted
    // const isBlacklisted = await redisClient.get(req.session.jwt);
    // if (isBlacklisted) {
    //   return next(); // Token is blacklisted, treat as no user
    // }

    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    req.currentUser = payload;
    
  } catch (err) {
    if (err instanceof Error && err.name === 'TokenExpiredError') {
      return res.status(401).send({ error: 'Token expired' });
    }

    if (err instanceof Error && err.name === 'JsonWebTokenError') {
      return res.status(401).send({ error: 'Invalid token' });
    }
  
    console.error('Unexpected error:', err);
    res.status(500).send({ error: 'Something went wrong' });
  }

  next();
};
