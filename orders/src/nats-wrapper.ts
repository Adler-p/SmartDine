import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client(): Stan {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }
    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });

      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._client) {
        this._client.on('close', () => {
          console.log('NATS connection closed');
          resolve();
        });
        this._client.close();
      } else {
        resolve();
      }
    });
  }
}

export const natsWrapper = new NatsWrapper();
