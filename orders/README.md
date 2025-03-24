# Orders Service

This service handles order management for the SmartDine application.

## API Endpoints

### List Customer Orders
- **GET** `/api/orders`
- Returns all orders for the authenticated customer
- Requires: Authentication (Customer only)
- Response: 200 OK
  ```json
  [
    {
      "id": "order_id",
      "userId": "user_id",
      "status": "created",
      "expiresAt": "2024-03-24T10:00:00Z",
      "items": [
        {
          "menuItemId": "menu_item_id",
          "name": "Item Name",
          "price": 10.99,
          "quantity": 2
        }
      ],
      "totalAmount": 21.98,
      "version": 0
    }
  ]
  ```

### List All Orders (Staff)
- **GET** `/api/orders/staff`
- Returns all orders in the system
- Requires: Authentication (Staff only)
- Response: 200 OK
  ```json
  [
    {
      "id": "order_id",
      "userId": "user_id",
      "status": "created",
      "expiresAt": "2024-03-24T10:00:00Z",
      "items": [
        {
          "menuItemId": "menu_item_id",
          "name": "Item Name",
          "price": 10.99,
          "quantity": 2
        }
      ],
      "totalAmount": 21.98,
      "version": 0
    }
  ]
  ```

### Get Single Order
- **GET** `/api/orders/:orderId`
- Returns details of a specific order
- Requires: Authentication (Order owner or Staff)
- Response: 200 OK
  ```json
  {
    "id": "order_id",
    "userId": "user_id",
    "status": "created",
    "expiresAt": "2024-03-24T10:00:00Z",
    "items": [
      {
        "menuItemId": "menu_item_id",
        "name": "Item Name",
        "price": 10.99,
        "quantity": 2
      }
    ],
    "totalAmount": 21.98,
    "version": 0
  }
  ```

### Create Order
- **POST** `/api/orders`
- Creates a new order
- Requires: Authentication (Customer only)
- Request Body:
  ```json
  {
    "items": [
      {
        "menuItemId": "menu_item_id",
        "name": "Item Name",
        "price": 10.99,
        "quantity": 2
      }
    ]
  }
  ```
- Validation:
  - Items array must not be empty
  - Each item must have a menuItemId
  - Each item quantity must be greater than 0
- Response: 201 Created

### Update Order Status (Staff)
- **PUT** `/api/orders/:orderId/status`
- Updates the status of an order
- Requires: Authentication (Staff only)
- Request Body:
  ```json
  {
    "status": "awaiting:preparation" | "in:preparation" | "ready" | "completed" | "cancelled"
  }
  ```
- Valid Status Transitions:
  - created → awaiting:preparation, cancelled
  - awaiting:preparation → in:preparation, cancelled
  - in:preparation → ready, cancelled
  - ready → completed, cancelled
  - completed → (no transitions allowed)
  - cancelled → (no transitions allowed)
- Response: 200 OK

### Cancel Order
- **DELETE** `/api/orders/:orderId`
- Cancels an order
- Requires: Authentication (Order owner only)
- Response: 204 No Content

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

### OrderCreated
```typescript
{
  id: string;
  version: number;
  status: string;
  userId: string;
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
```typescript
{
  id: string;
  version: number;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}
```

## Order Status Flow

```
created → awaiting:preparation → in:preparation → ready → completed
      ↘         ↘                   ↘              ↘
        cancelled  cancelled         cancelled      cancelled
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
docker build -t smartdine/orders .
```

Run the container:
```bash
docker run -p 3000:3000 smartdine/orders
``` 