import { Publisher, Subjects, SessionCreatedEvent } from '@smartdine/common';

export class SessionCreatedPublisher extends Publisher<SessionCreatedEvent> {
    readonly type = Subjects.SessionCreated;
} 