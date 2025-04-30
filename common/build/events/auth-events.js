"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEventType = void 0;
// Only applicable for restaurant staff 
var AuthEventType;
(function (AuthEventType) {
    AuthEventType["UserCreated"] = "user:created";
    AuthEventType["UserUpdated"] = "user:updated";
    AuthEventType["UserDeleted"] = "user:deleted";
})(AuthEventType || (exports.AuthEventType = AuthEventType = {}));
