# Orders Service

The Order Service is responsible for managing customer orders within the SmartDine application. It provides endpoints for creating new orders from a cart, viewing order details (for customers and staff), updating order status (for staff), and listing all orders (for staff). It also includes a background process to automatically cancel expired pending orders.

## Features

-   Creates new orders based on the items present in a customer's cart (retrieved from Redis).
-   Calculates the total amount of the order.
-   Persists order details and individual order items in a database.
-   Publishes an `order:created` event upon successful order creation.
-   Allows customers to view the details of their specific orders.
-   Enables staff to view details of specific orders and list all orders, with optional filtering by status.
-   Provides functionality for staff to update the status of an order, publishing an `order:cancelled` event if the status is changed to "cancelled".
-   Automatically cancels orders that remain in a "created" status for a defined period (currently 15 minutes).


## API Endpoints

### Create New Order (Customer)
-   **POST** `/api/orders`
-   **Description**: Creates a new order based on the items in the customer's cart. The cart is identified by the `tableId` provided in the request body. Requires a valid customer session.
-   **Requires**: Valid customer session (identified by `sessionId` in the cookie).
-   **Request Body**:
    ```json
    {
      "tableId": "table-123"
    }
    ```
-   **Validation**:
    -   `tableId`: Required, the ID of the table associated with the cart.
-   **Response**: `201 Created`
    ```json
    {
      "orderId": "order-uuid",
      "orderStatus": "created"
    }
    ```

### Get Order Details (Customer)
-   **GET** `/api/orders/:orderId`
-   **Description**: Retrieves the details of a specific order for the authenticated customer.
-   **Requires**: Valid customer session (identified by `sessionId` in the cookie).
-   **Path Parameter**:
    -   `orderId`: The UUID of the order to retrieve.
-   **Response**: `200 OK`
    ```json
    {
      "orderId": "order-uuid",
      "sessionId": "session-uuid",
      "tableId": "table-123",
      "orderStatus": "created",
      "totalAmount": 25.98,
      "createdAt": "2025-04-16T14:00:00.000Z",
      "updatedAt": "2025-04-16T14:00:00.000Z",
      "version": 0,
      "orderItems": [
        {
          "orderItemId": "order-item-uuid-1",
          "orderId": "order-uuid",
          "itemId": "item-1",
          "itemName": "Pizza",
          "unitPrice": 12.99,
          "quantity": 2,
          "subtotal": 25.98,
          "createdAt": "2025-04-16T14:00:00.000Z",
          "updatedAt": "2025-04-16T14:00:00.000Z"
        }
      ]
    }
    ```

### Update Order Status (Staff)
-   **PATCH** `/api/staff/orders/:orderId/status`
-   **Description**: Updates the status of a specific order. Requires staff authentication.
-   **Requires**: Authentication as a staff user.
-   **Path Parameter**:
    -   `orderId`: The UUID of the order to update.
-   **Request Body**:
    ```json
    {
      "orderStatus": "preparing"
    }
    ```
-   **Validation**:
    -   `orderStatus`: Required, must be one of the valid `OrderStatus` values: `"created"`, `"cancelled"`, `"awaiting:preparation"`, `"in:preparation"`, `"ready"`, `"completed"`.
-   **Response**: `200 OK`
    ```json
    {
      "orderId": "order-uuid",
      "sessionId": "session-uuid",
      "tableId": "table-123",
      "orderStatus": "preparing",
      "totalAmount": 25.98,
      "createdAt": "2025-04-16T14:00:00.000Z",
      "updatedAt": "2025-04-16T14:05:00.000Z",
      "version": 1,
      "orderItems": [...]
    }
    ```

### Get All Orders (Staff - Optional Filtering)
-   **GET** `/api/staff/orders`
-   **Description**: Retrieves a list of all orders. Requires staff authentication. Optionally filters by `orderStatus` using a query parameter.
-   **Requires**: Authentication as a staff user.
-   **Query Parameters**:
    -   `orderStatus`: Optional string to filter orders by status (e.g., `/api/staff/orders?orderStatus=preparing`).
-   **Response**: `200 OK`
    ```json
    [
      {
        "orderId": "order-uuid-1",
        "sessionId": "session-uuid-1",
        "tableId": "table-123",
        "orderStatus": "created",
        "totalAmount": 15.50,
        "createdAt": "...",
        "updatedAt": "...",
        "version": 0,
        "orderItems": [...]
      },
      {
        "orderId": "order-uuid-2",
        "sessionId": "session-uuid-2",
        "tableId": "table-456",
        "orderStatus": "delivered",
        "totalAmount": 32.00,
        "createdAt": "...",
        "updatedAt": "...",
        "version": 2,
        "orderItems": [...]
      }
      // ... more orders
    ]
    ```

### Get Order Details (Staff)
-   **GET** `/api/staff/orders/:orderId`
-   **Description**: Retrieves the details of a specific order for staff users.
-   **Requires**: Authentication as a staff user.
-   **Path Parameter**:
    -   `orderId`: The UUID of the order to retrieve.
-   **Response**: `200 OK` (Same structure as the customer's get order details)

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

### `order:created`
-   **Description**: Published when a new order is successfully created 
-   **Event Publisher**: [OrderCreatedPublisher]
-   **Event Data**:
    ```typescript
    {
      "orderId": "string",
      "version": number,
      "sessionId": "string",
      "tableId": "string",
      "orderStatus": "created" | "cancelled" | "awaiting:preparation" | "in:preparation" | "ready" | "completed",
  "totalAmount": number,
      "createdAt": "string (ISO 8601)",
      "items": [
        {
          "itemId": "string",
          "itemName": "string",
          "unitPrice": number,
          "quantity": number
        }
        // ... more items
      ]
    }
    ```

### `order:cancelled`
-   **Description**: Published when an order's status is updated to "cancelled" (either by staff action or the expired order cancellation process)
-   **Event Publisher**: [OrderCancelledPublisher]
-   **Event Data**:
    ```typescript
    {
      "orderId": "string"
    }
    ```

## Events Subscribed

### `payment:updated`
-   **Description**: Listens for this event from the Payment service. Updates the order status based on the payment status:
    -   If `paymentStatus` is `failed`, the order status is set to `cancelled`.
    -   If `paymentStatus` is `successful`, the order status is set to `awaiting_preparation`.
-   **Event Listener**: [PaymentUpdatedListener]
-   **Event Data**:
    ```typescript
    {
      "subject": "payment:updated",
      "data": {
        "orderId": "string",
        "paymentStatus": "successful" | "failed"
      }
    }
    ```

### `cart:finalised`
-   **Description**: Listens for this event from the Cart service. Upon receiving it, the Orders service creates a new order in its database using the cart details provided in the event.
-   **Event Listener**: [CartFinalisedListener]
-   **Event Data**: 
    ```json
    {
      "sessionId": "user-session-uuid",
      "tableId": "table-uuid",
      "items": [
        {
          "itemId": "menu-item-uuid-1",
          "itemName": "Item Name 1",
          "unitPrice": 10.99,
          "quantity": 1
        },
        {
          "itemId": "menu-item-uuid-2",
          "itemName": "Item Name 2",
          "unitPrice": 5.50,
          "quantity": 2
        }
        // ... more items from the cart
      ]
    }
    ```

## Order Status Flow

```
created → awaiting:preparation → in:preparation → ready → completed
      ↘             ↘                 
        cancelled  cancelled                  
```

## Environment Variables

- `JWT_KEY`: Secret key for JWT validation (required)
- `POSTGRES_URI`: PostgreSQL connection string (required)
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
docker build -t smartdine/orders .
```

Run the container:
```bash
docker run -p 3000:3000 smartdine/orders
``` 

## Technical Stack
- Node.js with TypeScript
- Express.js
- Sequelize with PostgreSQL
- Redis for caching cart data
- NATS Streaming for event bus
- Jest for testing

## Project Structure
```
orders/
├── src/
│   ├── app.ts                # Express app setup
│   ├── index.ts              # Service entry point
│   ├── routes/               # Route handlers
│   │   ├── customer/         # Routes for customers
│   │       ├── new-order.ts  # Create a new order route
│   │       ├── view-order.ts # Retrieve customer's order route
│   │   ├── staff.ts          # Routes for staff
│   │       ├── update-order-status.ts   # Update order status route
│   │       ├── view-all-orders.ts   # Retrieve all orders route
│   │       ├── view-order.ts # Retrieve a specific order route
│   ├── events/               # Event listeners and publishers
│   │   ├── publishers/
│   │   │   ├── order-created-publisher.ts  # Publishes OrderCreated events
│   │   │   ├── order-cancelled-publisher.ts # Publishes OrderCancelled events
│   │   └── listeners/
│   │       ├── payment-updated-listener.ts # Handles PaymentUpdated events
│   ├── models/               # Data models
│   │   ├── order.ts          # Order model
│   │   └── orderItem.ts      # Order item model
│   ├── test/                 # Test setup and utilities
│   │   ├── setup.ts          # Test environment setup
│   ├── services/             # Utility functions
│   │   └── check-expired-orders.ts # Utility to check expired orders
│   ├── nats-wrapper.ts       # NATS client wrapper
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── Dockerfile                # Docker configuration
├── .env                      # Environment variables
├── README.md                 # Documentation for the service
```