import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';
import { AuthEventType } from './auth-events';

interface Event {
  type: Subjects | AuthEventType;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract type: T['type'];
  protected client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.type, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log('Event published:', this.type);
        resolve();
      });
    });
  }
}
