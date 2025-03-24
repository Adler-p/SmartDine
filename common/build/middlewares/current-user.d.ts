import { Request, Response, NextFunction } from 'express';
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
export declare const currentUser: (req: Request, res: Response, next: NextFunction) => void;
export {};
