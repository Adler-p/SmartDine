# Cart Service

The Cart Service is responsible for managing shopping carts for customer sessions in the SmartDine application. It allows customers to add, view, update, and remove items from their cart.

## Features
-   Initializes an empty cart upon receiving a `session:created` event from the Auth service.
-   Allows adding of items, updating quantity of items, removal of items, and viewing of the cart.
-   Persists cart data in Redis, associated with the customer's `sessionId`.

## API Endpoints

### **Add Item to Cart**
-   **GET** `/api/cart/add`
-   **Description**: Adds a new item to the cart
-   **Requires**: Valid `sessionId` from cookie
-   **Request Body**:
    ```json
    {
      "item": {
        "itemId": "product_id",
        "itemName": "Product Name",
        "unitPrice": 10.99,
        "quantity": 2
      }
    }
    ```
-   **Validation**:
    -   `item`: Required, an object containing item details
    -   `item.itemId`: Required, string (within the `item` object)
    -   `item.itemName`: Required, string (within the `item` object)
    -   `item.unitPrice`: Required, number (within the `item` object)
    -   `item.quantity`: Required, integer greater than 0 (within the `item` object)
-   **Response**: `200 OK`
    ```json
    {
        "message": "Item added to cart", 
        "sessionId": "session_id",
        "cart": [
        { "itemId": "product_id", "itemName": "Product Name", "unitPrice": 10.99, "quantity": 2 }
        // ... other items
        ]
    }
    ```

### **Clear Cart**
-   **POST** `/api/cart/clear`
-   **Description**: Clears all items from the customer's cart
-   **Requires**: Valid `sessionId` from cookie
-   **Request Body**: None
-   **Response**:
    -   `200 OK`: Returns a success message and the empty cart
        ```json
        {
          "message": "Cart cleared",
          "cart": []
        }
        ```
    -   `400 Bad Request`: Session data is missing.

### **Update Cart Item Quantity**
-   **POST** `/api/cart/update-quantity`
-   **Description**: Updates the quantity of an item in the cart.
-   **Request Body**:
    ```json
    {
        "itemId": "product_id", 
        "quantity": "2"
    }
    ```
-   **Validation**:
    -   `itemId`: Required, string
    -   `quantity`: Required, integer greater than 0
-   **Response**: `200 OK`
    ```json
    {
        "message": "Cart updated", 
        "sessionId": "session_id", 
        "cart": [
            {
                "itemId": "product_id",
                "itemName": "Product Name",
                "unitPrice": 10.99,
                "quantity": 2
            }, // ... other items
        ]
    }
    ```

### Remove Item from Cart
-   **POST** `/api/cart/remove`
-   **Description**: Removes a specific item from the customer's cart
-   **Requires**: Valid `sessionId` from cookie
-   **Request Body**:
    ```json
    {
      "itemId": "product_id"
    }
    ```
-   **Validation**:
    -   `itemId`: Required, the ID of the item to remove
-   **Response**:
    -   `200 OK`: Returns a success message, the `sessionId`, and the updated cart
        ```json
        {
          "message": "Item removed from cart",
          "sessionId": "session_id",
          "cart": [
            // ... cart items after removal
          ]
        }
        ```

### View Cart
-   **GET** `/api/cart`
-   **Description**: Retrieves the contents of the customer's cart.
-   **Requires**: Valid `sessionId` (typically from a cookie).
-   **Request Body**: None.
-   **Response**:
    -   `200 OK`: Returns the current cart. If the cart is empty, it returns an empty array.
        ```json
        {
          "cart": [
            { "itemId": "product_id", "itemName": "Product Name", "unitPrice": 10.99, "quantity": 2 },
            { "itemId": "another_id", "itemName": "Another Product", "unitPrice": 5.50, "quantity": 1 }
            // ...
          ]
        }
        ```
        or
        ```json
        {
          "cart": []
        }
        ```

## Events

## Events Consumed

### `session:created`
-   **Description**: Initializes a cart when a new session is created.
-   **Event Listener**: [SessionCreatedListener]
-   **Event Data**:
    ```json
    {
        "subject": "session:created",
        "data": {
            "sessionId": "abc-123-xyz-456",
            "tableId": "T42",
            "role": "customer"
        }
    }
    ```
-   **Behavior**:
    -   Creates an empty cart in Redis for the session.
    -   Sets a 15-minute expiration for the cart.

## Events Published

### `cart:updated`
-   **Description**: Published when the contents of a customer's cart are updated (item added, removed, quantity changed, or cart cleared).
-   **Event Publisher**: [CartUpdatedPublisher]
-   **Event Data:**
    ```json
    {
        "sessionId": "abc-123-xyz-456",
        "items": [
            {
            "itemId": "product_id",
            "itemName": "Product Name",
            "unitPrice": 12.99, 
            "quantity": 2
            }
            // ... more items
        ],
        "totalItems": 5,
        "totalPrice": 20
    }
    ```

## Environment Variables

- `REDIS_HOST`: Redis server hostname (required)
- `REDIS_PORT`: Redis server port
- `NATS_URL`: NATS streaming server URL
- `NATS_CLUSTER_ID`: NATS streaming cluster ID
- `NATS_CLIENT_ID`: NATS streaming client ID
- `POSTGRES_URI`: POSTGRES connection string 

## Redis Storage

The cart is stored in Redis under the key `session:<sessionId>`.

### Example:
**Key**: `session:session-123`\
**Value**:
```json
{
    "role": "", 
    "tableId": "table123", 
    "cart": [
        {
            "itemId": "product_id",
            "itemName": "Product Name",
            "unitPrice": 10.99,
            "quantity": 2
        }, // ... other items
    ]
}
```

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

## Technical Stack
- Node.js with TypeScript
- Express.js
- Redis for data storage
- NATS Streaming for event bus
- Jest for testing

## Project Structure
```
cart/
├── src/
│   ├── app.ts                # Express app setup
│   ├── index.ts              # Service entry point
│   ├── routes/               # Route handlers
│   │   ├── view-cart.ts      # Retrieve cart route
│   │   ├── clear-cart.ts     # Clear/Empty cart route
│   │   ├── add-item.ts       # Add item to cart route
│   │   ├── update-quantity.ts # Update item quantity route
│   │   └── remove-item.ts    # Remove item from cart route
│   ├── events/               # Event listeners
│   │   └── listeners/
│   │       ├── session-created-listener.ts # Handles SessionCreated events
│   │   └── publishers/
│   │       └── cart-updated-publisher.ts    # Handles CartUpdated events
│   ├── models/               # Data models
│   │   └── cart-item.ts      # Cart model
│   ├── redis-client.ts       # Redis client setup
│   ├── nats-wrapper.ts       # NATS client wrapper
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── Dockerfile                # Docker configuration
├── .env                      # Environment variables
├── README.md                 # Documentation for the service
```
* * * * *
