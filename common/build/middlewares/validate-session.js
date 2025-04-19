"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = void 0;
const validateSession = (redisClient) => {
    return async (req, res, next) => {
        var _a;
        const sessionId = req.query.sessionId || ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.sessionId);
        if (!sessionId) {
            return res.status(400).send({ error: 'Session ID is required' });
        }
        const sessionData = await redisClient.get(`session:${sessionId}`);
        if (!sessionData) {
            return res.status(401).send({ error: 'Invalid or expired session ID' });
        }
        req.sessionData = JSON.parse(sessionData);
        next();
    };
};
exports.validateSession = validateSession;
