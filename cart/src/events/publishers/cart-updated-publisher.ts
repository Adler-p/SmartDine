// cart/src/events/publishers/cart-updated-publisher.ts
import { Publisher, Subjects, CartUpdatedEvent } from '@smartdine/common';
import { natsWrapper } from '../../nats-wrapper';

export class CartUpdatedPublisher extends Publisher<CartUpdatedEvent> {
  readonly type: Subjects.CartUpdated = Subjects.CartUpdated;
}