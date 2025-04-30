import { Subjects } from './subjects';
export interface SessionCreatedEvent {
    type: Subjects.SessionCreated;
    subject: Subjects.SessionCreated;
    data: {
        sessionId: string;
        role: string;
        tableId: string;
    };
}
