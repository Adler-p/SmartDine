import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';
import { AuthEventType } from './auth-events';
interface Event {
    type: Subjects | AuthEventType;
    data: any;
}
export declare abstract class Publisher<T extends Event> {
    abstract type: T['type'];
    protected client: Stan;
    constructor(client: Stan);
    publish(data: T['data']): Promise<void>;
}
export {};
