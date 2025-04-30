"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const currentUser = (redisClient) => async (req, res, next) => {
    var _a;
    const token = typeof req.session === 'string' ? req.session : (_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt;
    if (!token) {
        return next(); // No token, proceed without attaching currentUser
    }
    try {
        // // Check if the token is blacklisted
        // const isBlacklisted = await redisClient.get(req.session.jwt);
        // if (isBlacklisted) {
        //   return next(); // Token is blacklisted, treat as no user
        // }
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
        req.currentUser = payload;
    }
    catch (err) {
        if (err instanceof Error && err.name === 'TokenExpiredError') {
            return res.status(401).send({ error: 'Token expired' });
        }
        if (err instanceof Error && err.name === 'JsonWebTokenError') {
            return res.status(401).send({ error: 'Invalid token' });
        }
        console.error('Unexpected error:', err);
        res.status(500).send({ error: 'Something went wrong' });
    }
    next();
};
exports.currentUser = currentUser;
