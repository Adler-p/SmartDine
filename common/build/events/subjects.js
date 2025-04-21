"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subjects = void 0;
var Subjects;
(function (Subjects) {
    Subjects["SessionCreated"] = "session:created";
    Subjects["CartUpdated"] = "cart:updated";
    Subjects["CartFinalised"] = "cart:finalised";
    Subjects["OrderCreated"] = "order:created";
    Subjects["OrderCancelled"] = "order:cancelled";
    Subjects["ExpirationComplete"] = "expiration:complete";
    Subjects["PaymentCreated"] = "payment:created";
    Subjects["PaymentUpdated"] = "payment:updated";
    Subjects["PaymentFailed"] = "payment:failed";
    Subjects["PaymentSuccess"] = "payment:success";
    Subjects["MenuItemCreated"] = "menu:item:created";
    Subjects["MenuItemUpdated"] = "menu:item:updated";
})(Subjects || (exports.Subjects = Subjects = {}));
