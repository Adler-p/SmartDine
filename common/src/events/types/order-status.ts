export enum OrderStatus {
  // When the order has been created, but the
  // ticket it is trying to order has not been reserved
  CREATED = 'created',

  // The ticket the order is trying to reserve has already
  // been reserved, or when the user has cancelled the order.
  // The order expires before payment
  CANCELLED = 'cancelled',

  // The order has successfully reserved the ticket
  AWAITING_PREPARATION = 'awaiting:preparation',

  // The order has reserved the ticket and the user has
  // provided payment successfully
  IN_PREPARATION = 'in:preparation',

  // The order has reserved the ticket and the user has
  // provided payment successfully
  READY = 'ready',

  // The order has reserved the ticket and the user has
  // provided payment successfully
  COMPLETED = 'completed'
}
