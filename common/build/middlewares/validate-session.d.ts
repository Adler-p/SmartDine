import express, { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
export declare const validateSession: (redisClient: Redis) => (req: Request, res: Response, next: NextFunction) => Promise<express.Response<any, Record<string, any>> | undefined>;
