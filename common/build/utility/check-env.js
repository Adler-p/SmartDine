"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnvVariables = void 0;
// Utility function to check required environment variables
const checkEnvVariables = (vars) => {
    vars.forEach((v) => {
        if (!process.env[v]) {
            throw new Error(`${v} must be defined`);
        }
    });
};
exports.checkEnvVariables = checkEnvVariables;
