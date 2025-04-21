import { Publisher, Subjects, CartFinalisedEvent } from '@smartdine/common';
import { natsWrapper } from '../../nats-wrapper';

export class CartFinalisedPublisher extends Publisher<CartFinalisedEvent> {
  readonly type: Subjects.CartFinalised = Subjects.CartFinalised;
}