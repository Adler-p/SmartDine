# SmartDine Common Library

This library contains shared code for the SmartDine microservices architecture, including error handling, middleware, events, and types.

## Installation

```bash
npm install @smartdine/common
```

## Contents

### Error Handling
- `CustomError`: Base abstract class for all custom errors
- `DatabaseConnectionError`: Handles database connection issues
- `NotAuthorizedError`: Handles unauthorized access attempts
- `NotFoundError`: Handles 404 not found errors
- `RequestValidationError`: Handles request validation failures

### Middleware
- `currentUser`: Extracts and validates current user from session
- `errorHandler`: Global error handling middleware
- `requireAuth`: Ensures user is authenticated
- `requireRole`: Ensures user has required role
- `validateRequest`: Validates incoming requests

### Events

#### Authentication Events
```typescript
enum AuthEventType {
  UserCreated = 'user:created',
  UserUpdated = 'user:updated',
  UserDeleted = 'user:deleted'
}

interface UserCreatedEvent {
  type: AuthEventType.UserCreated;
  data: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    version: number;
  };
}
```

#### Order Events
```typescript
enum OrderStatus {
  Created = 'created',
  Cancelled = 'cancelled',
  AwaitingPreparation = 'awaiting:preparation',
  InPreparation = 'in:preparation',
  Ready = 'ready',
  Completed = 'completed'
}

interface OrderCreatedEvent {
  type: Subjects.OrderCreated;
  data: {
    id: string;
    version: number;
    status: OrderStatus;
    userId: string;
    expiresAt: string;
    items: {
      menuItemId: string;
      name?: string;
      price?: number;
      quantity?: number;
    }[];
  };
}
```

#### Payment Events
```typescript
enum PaymentStatus {
  Created = 'created',
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'refunded'
}

interface PaymentCreatedEvent {
  type: Subjects.PaymentCreated;
  data: {
    id: string;
    orderId: string;
    amount: number;
    status: string;
    userId: string;
    version: number;
  };
}
```

#### Menu Events
```typescript
interface MenuItemCreatedEvent {
  type: Subjects.MenuItemCreated;
  data: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    availability: string;
    version: number;
  };
}
```

#### Expiration Events
```typescript
interface ExpirationCompleteEvent {
  subject: Subjects.ExpirationComplete;
  data: {
    orderId: string;
  };
}
```

### Enums

```typescript
enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff'
}

enum Subjects {
  OrderCreated = 'order:created',
  OrderCancelled = 'order:cancelled',
  ExpirationComplete = 'expiration:complete',
  PaymentCreated = 'payment:created',
  PaymentUpdated = 'payment:updated',
  MenuItemCreated = 'menu:item:created',
  MenuItemUpdated = 'menu:item:updated'
}
```

## Usage Examples

### Error Handling
```typescript
import { NotAuthorizedError } from '@smartdine/common';

if (!currentUser) {
  throw new NotAuthorizedError();
}
```

### Authentication
```typescript
import { requireAuth, UserRole } from '@smartdine/common';

router.post('/api/orders',
  requireAuth,
  requireRole(UserRole.CUSTOMER),
  async (req, res) => {
    // Create order
  }
);
```

### Event Publishing
```typescript
import { Publisher, OrderCreatedEvent } from '@smartdine/common';

class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject = Subjects.OrderCreated;
}

await publisher.publish({
  id: order.id,
  status: order.status,
  userId: order.userId,
  version: order.version
});
```

### Event Listening
```typescript
import { Listener, PaymentCreatedEvent } from '@smartdine/common';

class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject = Subjects.PaymentCreated;
  queueGroupName = 'orders-service';

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    // Handle payment created event
    msg.ack();
  }
}
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Build the package:
```bash
npm run build
```

3. Publish to npm:
```bash
npm publish
``` 