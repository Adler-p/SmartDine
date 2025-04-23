// Extend the Request interface to include sessionData
export {};

declare global {
  namespace Express {
    interface Request {
      sessionData?: {
        sessionId: string;
        [key: string]: any; // Add other session-related fields if needed
      };
    }
  }
}