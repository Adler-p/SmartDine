import { Publisher, Subjects, PaymentUpdatedEvent } from '@smartdine/common';

export class PaymentUpdatedPublisher extends Publisher<PaymentUpdatedEvent> {
  readonly type = Subjects.PaymentUpdated;
} 