import { UserRole } from '../types/user-role';

// Only applicable for restaurant staff 
export enum AuthEventType {
  UserCreated = 'user:created',
  UserUpdated = 'user:updated',
  UserDeleted = 'user:deleted'
}

export interface UserCreatedEvent {
  type: AuthEventType.UserCreated;
  data: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    version: number;
  };
}

export interface UserUpdatedEvent {
  type: AuthEventType.UserUpdated;
  data: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    version: number;
  };
}

export interface UserDeletedEvent {
  type: AuthEventType.UserDeleted;
  data: {
    id: string;
    version: number;
  };
} 