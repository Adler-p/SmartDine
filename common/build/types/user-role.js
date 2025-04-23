"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["STAFF"] = "staff";
})(UserRole || (exports.UserRole = UserRole = {}));
// 移除重复的声明，因为已经在current-user.ts中定义了
