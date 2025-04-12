export declare enum UserRole {
    CUSTOMER = "customer",
    STAFF = "staff"
}
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
