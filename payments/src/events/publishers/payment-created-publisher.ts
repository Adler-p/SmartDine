import { Publisher, Subjects, PaymentCreatedEvent } from '@smartdine/common';

// Publisher for payment created events
export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
} 