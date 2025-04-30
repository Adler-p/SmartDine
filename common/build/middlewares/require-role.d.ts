import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user-role';
export declare const requireRole: (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
