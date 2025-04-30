"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = void 0;
const nats_wrapper_1 = require("../class/nats-wrapper");
// Graceful shutdown handler
const gracefulShutdown = async (dbConnection) => {
    var _a;
    console.log('Received shutdown signal. Starting graceful shutdown...');
    try {
        // Close NATS connection
        nats_wrapper_1.natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
        });
        nats_wrapper_1.natsWrapper.client.close();
        // Close database connection if provided
        if (dbConnection) {
            if (typeof dbConnection.close === 'function') {
                await dbConnection.close();
            }
            else if (typeof ((_a = dbConnection.connection) === null || _a === void 0 ? void 0 : _a.close) === 'function') {
                await dbConnection.connection.close();
            }
            console.log('Database connection closed');
        }
        // Exit process
        process.exit(0);
    }
    catch (err) {
        console.error('Error during graceful shutdown:', err);
        process.exit(1);
    }
};
exports.gracefulShutdown = gracefulShutdown;
