import express, { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

export const validateSession = (redisClient: Redis) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      console.log('Reached validateSession middleware');
      
      // 修复获取sessionId的方式
      let sessionId = req.query.sessionId as string || undefined;
      
      // 检查cookies中的sessionId
      if (!sessionId && req.cookies) {
        sessionId = req.cookies.sessionId || (req.cookies.session && req.cookies.session.sessionId);
      }
      
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
  
      // 解析sessionData并添加sessionId
      const parsedSessionData = JSON.parse(sessionData);
      parsedSessionData.sessionId = sessionId; // 确保sessionId在sessionData中可用
      
      req.sessionData = parsedSessionData;
      next();
    };
  };