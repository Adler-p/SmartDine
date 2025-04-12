import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/not-authorized-error';
import { UserRole } from '../types/user-role';

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    const hasRole = roles.includes(req.currentUser.role as UserRole);
    if (!hasRole) {
      throw new NotAuthorizedError();
    }

    next();
  };
}; 