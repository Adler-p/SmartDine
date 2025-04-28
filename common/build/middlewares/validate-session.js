"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = void 0;
const validateSession = (redisClient) => {
    return async (req, res, next) => {
        console.log('Reached validateSession middleware');
        // 修复获取sessionId的方式
        let sessionId = req.query.sessionId || undefined;
        // 检查cookies中的sessionId
        if (!sessionId && req.cookies) {
            sessionId = req.cookies.sessionId || (req.cookies.session && req.cookies.session.sessionId);
        }
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
