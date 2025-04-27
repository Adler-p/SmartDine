import nats, { Stan } from 'node-nats-streaming'

// Singleton class to manage NATS client connection
class NatsWrapper {
  private _client?: Stan

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting')
    }
    return this._client
  }

  connect(clusterId: string, clientId: string, url: string) {
    console.log(`Attempting to connect to NATS: ${clusterId}, ${clientId}, ${url}`);
    this._client = nats.connect(clusterId, clientId, { url })

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS')
        resolve()
      })
      this.client.on('error', (err) => {
        console.error('NATS connection error:', err);
        reject(err)
      })
      this.client.on('disconnect', () => {
        console.log('Disconnected from NATS');
      })
      this.client.on('reconnect', () => {
        console.log('Reconnected to NATS');
      })
      this.client.on('reconnecting', () => {
        console.log('Reconnecting to NATS...');
      })
      this.client.on('close', () => {
        console.log('NATS connection closed');
      })
    })
  }
}

export const natsWrapper = new NatsWrapper() 