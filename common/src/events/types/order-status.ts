export enum OrderStatus {
  // When the order has been created, but the
  // ticket it is trying to order has not been reserved
  Created = 'created',

  // The ticket the order is trying to reserve has already
  // been reserved, or when the user has cancelled the order.
  // The order expires before payment
  Cancelled = 'cancelled',

  // The order has successfully reserved the ticket
  AwaitingPreparation = 'awaiting:preparation',

  // The order has reserved the ticket and the user has
  // provided payment successfully
  InPreparation = 'in:preparation',

  // The order has reserved the ticket and the user has
  // provided payment successfully
  Ready = 'ready',

  // The order has reserved the ticket and the user has
  // provided payment successfully
  Completed = 'completed'
}
