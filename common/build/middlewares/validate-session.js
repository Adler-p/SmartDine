"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = void 0;
const validateSession = (redisClient) => {
    return async (req, res, next) => {
        var _a, _b;
        console.log('Reached validateSession middleware');
        const sessionId = req.query.sessionId || ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.session.sessionId) || ((_b = req.session) === null || _b === void 0 ? void 0 : _b.sessionId);
        console.log('Session ID:', sessionId);
        if (!sessionId) {
            return res.status(400).send({ error: 'Session ID is required' });
        }
        const sessionData = await redisClient.get(`session:${sessionId}`);
        console.log('Session Data:', sessionData);
        if (!sessionData) {
            return res.status(401).send({ error: 'Invalid or expired session ID' });
        }
        req.sessionData = JSON.parse(sessionData);
        next();
    };
};
exports.validateSession = validateSession;
