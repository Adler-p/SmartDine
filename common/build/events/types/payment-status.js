"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Created"] = "created";
    PaymentStatus["Pending"] = "pending";
    PaymentStatus["Completed"] = "completed";
    PaymentStatus["Failed"] = "failed";
    PaymentStatus["Refunded"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
