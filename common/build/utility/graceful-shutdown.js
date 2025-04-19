"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = void 0;
const nats_wrapper_1 = require("../class/nats-wrapper");
const mongoose_1 = __importDefault(require("mongoose"));
// Graceful shutdown handler
const gracefulShutdown = async () => {
    console.log('Received shutdown signal. Starting graceful shutdown...');
    try {
        // Close NATS connection
        nats_wrapper_1.natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
        });
        nats_wrapper_1.natsWrapper.client.close();
        // Close MongoDB connection
        await mongoose_1.default.connection.close();
        console.log('MongoDB connection closed');
        // Exit process
        process.exit(0);
    }
    catch (err) {
        console.error('Error during graceful shutdown:', err);
        process.exit(1);
    }
};
exports.gracefulShutdown = gracefulShutdown;
