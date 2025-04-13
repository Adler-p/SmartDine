import { Publisher, Subjects, PaymentUpdatedEvent } from '@smartdine/common';

// Publisher for payment failed events
export class PaymentUpdatedPublisher extends Publisher<PaymentUpdatedEvent> {
  readonly type = Subjects.PaymentUpdated;
} 