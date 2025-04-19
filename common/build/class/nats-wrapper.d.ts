import nats from 'node-nats-streaming';
declare class NatsWrapper {
    private _client?;
    get client(): nats.Stan;
    connect(clusterId: string, clientId: string, url: string): Promise<void>;
}
export declare const natsWrapper: NatsWrapper;
export {};
