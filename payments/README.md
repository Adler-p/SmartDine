# Payments Service

This service handles payment processing and management for the SmartDine application.

## API Endpoints

### List All Payments
- **GET** `/api/payments`
- Returns all payments in the system
- Requires: Authentication (Staff only)
- Response: 200 OK
  ```json
  [
    {
      "id": "payment_id",
      "orderId": "order_id",
      "amount": 29.99,
      "status": "created",
      "userId": "user_id",
      "version": 0
    }
  ]
  ```

### Get Single Payment
- **GET** `/api/payments/:id`
- Returns details of a specific payment
- Requires: Authentication (Payment owner only)
- Response: 200 OK
  ```json
  {
    "id": "payment_id",
    "orderId": "order_id",
    "amount": 29.99,
    "status": "created",
    "userId": "user_id",
    "version": 0
  }
  ```

### Create Payment
- **POST** `/api/payments`
- Creates a new payment for an order
- Requires: Authentication (Order owner only)
- Request Body:
  ```json
  {
    "orderId": "order_id",
    "amount": 29.99
  }
  ```
- Validation:
  - orderId is required
  - amount must be greater than 0
  - Order must exist
  - Order must belong to the authenticated user
  - Order must not be cancelled
- Response: 201 Created
  ```json
  {
    "id": "payment_id",
    "orderId": "order_id",
    "amount": 29.99,
    "status": "created",
    "userId": "user_id",
    "version": 0
  }
  ```

### Update Payment Status
- **PUT** `/api/payments/:id/status`
- Updates the status of a payment
- Requires: Authentication (Staff only)
- Request Body:
  ```json
  {
    "status": "pending" | "completed" | "failed" | "refunded"
  }
  ```
- Valid Status Transitions:
  - created → pending, failed
  - pending → completed, failed
  - completed → refunded
  - failed → (no transitions allowed)
  - refunded → (no transitions allowed)
- Response: 200 OK
  ```json
  {
    "id": "payment_id",
    "orderId": "order_id",
    "amount": 29.99,
    "status": "updated_status",
    "userId": "user_id",
    "version": 1
  }
  ```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "errors": [
    {
      "message": "Error message",
      "field": "field_name"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "errors": [
    {
      "message": "Not authorized"
    }
  ]
}
```

### 404 Not Found
```json
{
  "errors": [
    {
      "message": "Not Found"
    }
  ]
}
```

## Events Published

### PaymentCreated
```typescript
{
  id: string;
  orderId: string;
  amount: number;
  status: string;
  userId: string;
  version: number;
}
```

### PaymentUpdated
```typescript
{
  id: string;
  orderId: string;
  amount: number;
  status: string;
  userId: string;
  version: number;
}
```

## Events Subscribed

### OrderCreated
- Creates a new order record in the payments service
- Data:
  ```typescript
  {
    id: string;
    userId: string;
    status: string;
    version: number;
    expiresAt: string;
    items: {
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
    }[];
  }
  ```

### OrderCancelled
- Updates the order status to cancelled
- Data:
  ```typescript
  {
    id: string;
    version: number;
  }
  ```

## Payment Status Flow

```
created → pending → completed → refunded
      ↘         ↘
        failed    failed
```

## Environment Variables

- `JWT_KEY`: Secret key for JWT validation (required)
- `MONGO_URI`: MongoDB connection string (required)
- `NATS_URL`: NATS streaming server URL (required)
- `NATS_CLUSTER_ID`: NATS streaming cluster ID (required)
- `NATS_CLIENT_ID`: NATS streaming client ID (required)

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm run test
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Docker

Build the image:
```bash
docker build -t smartdine/payments .
```

Run the container:
```bash
docker run -p 3000:3000 smartdine/payments
``` 