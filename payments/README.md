# Payments Service

The Payment Service is responsible for managing payment records associated with customer orders within the SmartDine application. It provides endpoints for customers and staff to update payment status and for staff to view payment information. It also listens for order-related events to manage payment records.

## Features

-   Creates a new payment record upon receiving an `order:created` event. The initial status is set to `pending`.
-   Allows authenticated customers to update the status of their payment records.
-   Enables authenticated staff to update the status of payment records.
-   Provides an endpoint for authenticated staff to view all payment records.
-   Allows authenticated staff to view a specific payment record by its associated `orderId`.
-   Listens for `order:cancelled` events and updates the corresponding payment status to `failed`.
-   Publishes a `payment:updated` event whenever a payment record's status is changed.


## API Endpoints

### Customer Update Payment Status
-   **POST** `/api/payments/update-status`
-   **Description**: Allows an authenticated customer to update the status of their payment.
-   **Requires**: Valid customer session (identified by `sessionId`).
-   **Request Body**:
    ```json
    {
      "orderId": "order-uuid",
      "paymentStatus": "successful"
    }
    ```
-   **Validation**:
    -   `orderId`: Required, a valid UUID.
    -   `paymentStatus`: Required, must be one of the valid `PaymentStatus` values: `"pending"`, `"successful"`, `"failed"`.
-   **Response**: `200 OK`
    ```json
    {
      "message": "Payment status updated successfully"
    }
    ```

### List All Payments (Staff)
-   **GET** `/api/payments`
-   **Description**: Retrieves a list of all payment records. Requires staff authentication.
-   **Requires**: Authentication as a staff user.
-   **Response**: `200 OK`
    ```json
    [
      {
        "paymentId": "payment-uuid-1",
        "orderId": "order-uuid-1",
        "stripeChargeId": null,
        "amount": 25.98,
        "paymentStatus": "successful",
        "paymentMethod": null,
        "sessionId": "session-uuid-1",
        "createdAt": "...",
        "updatedAt": "...",
        "version": 1
      },
      // ... more payment records
    ]
    ```

### Staff Update Payment Status
-   **POST** `/api/payments/staff/update-status`
-   **Description**: Allows authenticated staff to update the status of a payment record.
-   **Requires**: Authentication as a staff user.
-   **Request Body**:
    ```json
    {
      "orderId": "order-uuid",
      "paymentStatus": "failed"
    }
    ```
-   **Validation**:
    -   `orderId`: Required, a valid UUID.
    -   `paymentStatus`: Required, must be one of the valid `PaymentStatus` values: `"pending"`, `"successful"`, `"failed"`.
-   **Response**: `200 OK`
    ```json
    {
      "message": "Payment status updated successfully"
    }
    ```

### View Payment by Order ID (Staff)
-   **GET** `/api/payments/staff/:orderId`
-   **Description**: Retrieves a specific payment record based on its associated `orderId`. Requires staff authentication.
-   **Requires**: Authentication as a staff user.
-   **Path Parameter**:
    -   `orderId`: The UUID of the associated order.
-   **Response**: `200 OK`
    ```json
    {
      "paymentId": "payment-uuid",
      "orderId": "order-uuid",
      "stripeChargeId": null,
      "amount": 25.98,
      "paymentStatus": "successful",
      "paymentMethod": null,
      "sessionId": "session-uuid",
      "createdAt": "...",
      "updatedAt": "...",
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

## Events Subscribed

### `order:created`
-   **Description**: Listens for this event from the Order service. Creates a new payment record with a `pending` status.
-   **Event Listener**: [OrderCreatedListener]
-   **Event Data**:
    ```typescript
    {
      "subject": "order:created",
      "data": {
        "orderId": "string",
        "totalAmount": number,
        "sessionId": "string"
      }
    }
    ```

### `order:cancelled`
-   **Description**: Listens for this event from the Order service. Updates the payment status of the associated order to `failed`.
-   **Event Listener**: [OrderCancelledListener]
-   **Event Data**:
    ```typescript
    {
      "subject": "order:cancelled",
      "data": {
        "orderId": "string"
      }
    }
    ```

## Events Published

### `payment:updated`
-   **Description**: Published whenever the status of a payment record is updated.
-   **Event Publisher**: [PaymentUpdatedPublisher]
-   **Event Data:**
    ```typescript
    {
      "paymentId": "string",
      "orderId": "string",
      "amount": number,
      "paymentStatus": "pending" | "successful" | "failed",
      "version": number
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
- `POSTGRES_URI`: POSTGRES connection string (required)
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

## Project Structure
```
payments/
├── src/
│   ├── app.ts                # Express app setup
│   ├── index.ts              # Service entry point
│   ├── routes/               # Route handlers
│   │   ├── customer/         # Routes for customers
│   │   │   ├── customer-update-payment-status.ts  # Update payment status route
│   │   └── staff/            # Routes for staff
│   │       ├── list-all-payments.ts           # List all payments route
│   │       ├── view-order-payment.ts          # View a specific order's payment route
│   │       ├── staff-update-payment-status.ts # Update payment status route
│   ├── events/               # Event listeners and publishers
│   │   ├── publishers/
│   │   │   ├── payment-updated-publisher.ts   # Publishes PaymentUpdated events
│   │   └── listeners/
│   │       ├── order-created-listener.ts      # Handles OrderCreated events
│   │       ├── order-cancelled-listener.ts    # Handles OrderCancelled events
│   ├── models/               # Data models
│   │   ├── payment.ts        # Payment model
│   ├── services/             # Utility functions
│   │   └── payment-service.ts # Business logic for payment operations
│   ├── nats-wrapper.ts       # NATS client wrapper
│   ├── redis-client.ts       # Redis client setup
│   ├── sequelize.ts          # Sequelize setup for PostgreSQL
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── Dockerfile                # Docker configuration
├── .env                      # Environment variables
├── README.md                 # Documentation for the service
```