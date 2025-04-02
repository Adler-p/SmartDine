export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff'
}


//expand express request interface to include current user
declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
} 