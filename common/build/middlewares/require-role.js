"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const not_authorized_error_1 = require("../errors/not-authorized-error");
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.currentUser) {
            throw new not_authorized_error_1.NotAuthorizedError();
        }
        const hasRole = roles.includes(req.currentUser.role);
        if (!hasRole) {
            throw new not_authorized_error_1.NotAuthorizedError();
        }
        next();
    };
};
exports.requireRole = requireRole;
