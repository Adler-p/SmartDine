"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
class Publisher {
    constructor(client) {
        this.client = client;
    }
    publish(data) {
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
exports.Publisher = Publisher;
