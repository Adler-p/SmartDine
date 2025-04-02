import { Publisher, AuthEventType, UserCreatedEvent } from '@smartdine/common';

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  type: AuthEventType.UserCreated = AuthEventType.UserCreated;
} 