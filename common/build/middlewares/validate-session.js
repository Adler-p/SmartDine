"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSession = void 0;
const validateSession = (redisClient) => {
    return async (req, res, next) => {
        console.log('Reached validateSession middleware');
        let sessionId = req.query.sessionId || undefined;
        if (!sessionId && req.cookies) {
            sessionId = req.cookies.sessionId || (req.cookies.session && req.cookies.session.sessionId);
        }
        // 检查session中的sessionId
        if (!sessionId && req.session) {
            sessionId = req.session.sessionId;
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
        // 解析sessionData并添加sessionId
        const parsedSessionData = JSON.parse(sessionData);
        parsedSessionData.sessionId = sessionId; // 确保sessionId在sessionData中可用
        req.sessionData = parsedSessionData;
        next();
    };
};
exports.validateSession = validateSession;
