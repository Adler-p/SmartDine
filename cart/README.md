# Cart Service

The **Cart Service** is responsible for managing customer carts in the **SmartDine** application. It handles cart initialization, item updates, and cart retrieval for a given session.

## Features
-   Initializes a cart when a new session is created.
-   Allows updating item quantities in the cart.
-   Retrieves the current cart for a session.

## API Endpoints

### **Retrieve Cart**
-   **GET** `/api/cart`
-   **Description**: Retrieves the current cart for the session.
-   **Requires**: Valid session cookie.
-   **Response**: `200 OK`
```json
    {
      "cart": [
        {
          "itemId": "item-1",
          "itemName": "Pizza",
          "unitPrice": 12.99,
          "quantity": 2
        },
        {
          "itemId": "item-2",
          "itemName": "Pasta",
          "unitPrice": 8.99,
          "quantity": 1
        }
      ]
    }
```
* * * * *

### **Update Item Quantity**
-   **POST** `/api/cart/update-quantity`
-   **Description**: Updates the quantity of an item in the cart.
-   **Request Body**:
```json
    {
      "itemId": "item-1",
      "quantity": 3
    }
```
-   **Validation**:
    -   `itemId`: Must be provided.
    -   `quantity`: Must be a positive integer.
-   **Response**: `200 OK`
```json
    {
      "message": "Cart updated",
      "cart": [
        {
          "itemId": "item-1",
          "itemName": "Pizza",
          "unitPrice": 12.99,
          "quantity": 3
        },
        {
          "itemId": "item-2",
          "itemName": "Pasta",
          "unitPrice": 8.99,
          "quantity": 1
        }
      ]
    }
```
* * * * *

## Events

### **SessionCreated**
-   **Description**: Initializes a cart when a new session is created.
-   **Event Listener**: [SessionCreatedListener]
-   **Event Data**:
```json
    {
      "sessionId": "session-123",
      "role": "customer",
      "tableId": "table-1"
    }
```
-   **Behavior**:
    -   Creates an empty cart in Redis for the session.
    -   Sets a 15-minute expiration for the cart.

* * * * *

## Redis Storage

The cart is stored in Redis under the key `session:<sessionId>`.

### Example:
**Key**: `session:session-123`\
**Value**:
```json
{
  "role": "customer",
  "tableId": "table-1",
  "cart": [
    {
      "itemId": "item-1",
      "itemName": "Pizza",
      "unitPrice": 12.99,
      "quantity": 2
    }
  ]
}
```
* * * * *

## Environment Variables

-   `REDIS_HOST`: Redis server hostname.
-   `REDIS_PORT`: Redis server port.
-   `NATS_URL`: NATS streaming server URL.
-   `NATS_CLUSTER_ID`: NATS streaming cluster ID.
-   `NATS_CLIENT_ID`: NATS client ID.

* * * * *

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
docker build -t smartdine/cart .
```

Run the container:
```bash
docker run -p 3000:3000 smartdine/cart
```
* * * * *

## Project Structure
```
cart/
├── src/
│   ├── app.ts                # Express app setup
│   ├── index.ts              # Service entry point
│   ├── routes/               # Route handlers
│   │   ├── view-cart.ts      # Retrieve cart route
│   │   └── update-quantity.ts # Update item quantity route
│   ├── events/               # Event listeners
│   │   └── listeners/
│   │       └── session-created-listener.ts # Handles SessionCreated events
│   ├── redis-client.ts       # Redis client setup
│   ├── nats-wrapper.ts       # NATS client wrapper
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── Dockerfile                # Docker configuration
├── .env                      # Environment variables
```
* * * * *
