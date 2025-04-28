import express, { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

export const validateSession = (redisClient: Redis) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      console.log('Reached validateSession middleware');
      const sessionId = req.query.sessionId || req.cookies?.session.sessionId || req.session?.sessionId;
      console.log('Session ID:', sessionId);
  
      if (!sessionId) {
        return res.status(400).send({ error: 'Session ID is required' });
      }
  
      const sessionData = await redisClient.get(`session:${sessionId}`);
      console.log('Session Data:', sessionData);

      if (!sessionData) {
        return res.status(401).send({ error: 'Invalid or expired session ID' });
      }
  
      req.sessionData = JSON.parse(sessionData);
      next();
    };
  };