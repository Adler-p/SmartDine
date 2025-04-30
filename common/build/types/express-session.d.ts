export {};
declare global {
    namespace Express {
        interface Request {
            sessionData?: {
                sessionId: string;
                [key: string]: any;
            };
        }
    }
}
