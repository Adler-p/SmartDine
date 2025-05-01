import { Message } from 'node-nats-streaming';
import { Subjects, Listener, SessionCreatedEvent } from '@smartdine/common';
import { redis } from '../../redis-client';
import { queueGroupName } from './queue-group-name';

export class SessionCreatedListener extends Listener<SessionCreatedEvent> {
  readonly subject = Subjects.SessionCreated;
  queueGroupName = queueGroupName; 

  async onMessage(data: SessionCreatedEvent['data'], msg: Message) {
    const { sessionId } = data;

    try {
      // Initialize empty cart within the session data in Redis
      const sessionKey = `session:${sessionId}`;
      const initialSessionData = {
        role: data.role,
        tableId: data.tableId,
        cart: [],
      }

      // Set empty cart in Redis with expiration time 
      await redis.set(sessionKey, JSON.stringify(initialSessionData), 'EX', 15 * 60 * 1000); 
      console.log(`Cart initialized for sessionId: ${sessionId}`);
        
      msg.ack();
    } catch (err) {
      console.error('Error initializing cart:', err);
      msg.ack();
    }
  }
}