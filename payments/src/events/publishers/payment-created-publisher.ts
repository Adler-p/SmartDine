import { Publisher, Subjects, PaymentCreatedEvent } from '@smartdine/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly type: Subjects.PaymentCreated = Subjects.PaymentCreated;
} 