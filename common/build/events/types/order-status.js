"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    // When the order has been created, but the
    // ticket it is trying to order has not been reserved
    OrderStatus["CREATED"] = "created";
    // The ticket the order is trying to reserve has already
    // been reserved, or when the user has cancelled the order.
    // The order expires before payment
    OrderStatus["CANCELLED"] = "cancelled";
    // The order has successfully reserved the ticket
    OrderStatus["AWAITING_PREPARATION"] = "awaiting:preparation";
    // The order has reserved the ticket and the user has
    // provided payment successfully
    OrderStatus["IN_PREPARATION"] = "in:preparation";
    // The order has reserved the ticket and the user has
    // provided payment successfully
    OrderStatus["READY"] = "ready";
    // The order has reserved the ticket and the user has
    // provided payment successfully
    OrderStatus["COMPLETED"] = "completed";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
