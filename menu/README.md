# Menu Service

This service handles menu item management for the SmartDine application. It provides endpoints for creating, updating, retrieving, and listing menu items.

## Features
-   Allows staff to create new menu items with details like name, description, price, category, image URL, and availability.
-   Enables staff to update existing menu items, including marking them as out of stock or updating their price.
-   Provides endpoints for retrieving a list of all menu items, with optional filtering by category.
-   Allows retrieval of a single menu item by its ID.
-   Publishes events when menu items are created or updated to notify other services.


## API Endpoints

### Get All Menu Items (Optional Filtering)
-   **GET** `/api/menu`
-   **Description**: Retrieves a list of all menu items. Optionally filters by `category` using a query parameter
-   **Query Parameters**:
    -   `category`: Optional string to filter menu items by category (e.g., `/api/menu?category=Dessert`)
-   **Response**: `200 OK`
    ```json
    [
      {
        "id": "menuItemId1",
        "name": "Delicious Burger",
        "description": "...",
        "price": 12.99,
        "category": "Main",
        "imageUrl": "...",
        "availability": "available",
        "version": 0
      },
      {
        "id": "menuItemId2",
        "name": "Chocolate Cake",
        "description": "...",
        "price": 6.50,
        "category": "Dessert",
        "imageUrl": "...",
        "availability": "available",
        "version": 0
      }
      // ... more menu items
    ]
    ```

### Get Single Menu Item
-   **GET** `/api/menu/:id`
-   **Description**: Returns details of a specific menu item
-   **Requires**: Authentication (Staff or Customer)
-   **Response**: 200 OK
    ```json
    {
      "id": "menu_item_id",
      "name": "Item Name",
      "description": "Item Description",
      "price": 10.99,
      "category": "Category",
      "imageUrl": "https://example.com/image.jpg",
      "availability": "available",
      "version": 0
    }
    ```

### Create New Menu Item (Staff)
-   **POST** `/api/menu`
-   **Description**: Creates a new menu item. Requires staff authentication
-   **Requires**: Authentication as a staff user
-   **Request Body**:
    ```json
    {
      "name": "Delicious Burger",
      "description": "A juicy beef burger with all the fixings.",
      "price": 12.99,
      "category": "Main",
      "imageUrl": "https://example.com/burger.jpg",
      "availability": "available"
    }
    ```
-   **Validation**:
    -   `name`: Required, not empty
    -   `description`: Required, not empty
    -   `price`: Required, must be a number greater than 0
    -   `category`: Required, not empty
    -   `imageUrl`: Optional, must be a valid URL
    -   `availability`: Optional, must be either `"available"` or `"out_of_stock"`, defaults to `"available"`
-   **Response**: `201 Created`
    ```json
    {
      "id": "menuItemId",
      "name": "Delicious Burger",
      "description": "A juicy beef burger with all the fixings.",
      "price": 12.99,
      "category": "Main",
      "imageUrl": "https://example.com/burger.jpg",
      "availability": "available",
      "version": 0
    }
    ```

### Update Menu Item
-   **PUT** `/api/menu/:id`
-   **Description**: Updates an existing menu item
-   **Requires**: Authentication as a staff user.
-   **Request Body**: (all fields optional):
    ```json
    {
      "name": "Updated Name",
      "description": "Updated Description",
      "price": 12.99,
      "category": "Updated Category",
      "imageUrl": "https://example.com/new-image.jpg",
      "availability": "available"
    }
    ```
-   **Validation**:
    -   Name cannot be empty if provided
    -   Description cannot be empty if provided
    -   Price must be greater than 0 if provided
    -   Category cannot be empty if provided
    -   Image URL must be valid if provided
    -   Availability must be either "available" or "out_of_stock" if provided
-   **Response**: `200 OK`

### Update Menu Item Price (Staff)
-   **PATCH** `/api/menu/:id/price`
-   **Description**: Updates the price of an existing menu item. Requires staff authentication.
-   **Requires**: Authentication as a staff user.
-   **Path Parameter**:
    -   `id`: The ID of the menu item to update.
-   **Request Body**:
    ```json
    {
      "price": 14.00
    }
    ```
-   **Validation**:
    -   `price`: Required, must be a positive number.
-   **Response**: `200 OK`
    ```json
    {
      "id": "menuItemId",
      "name": "Amazing Burger",
      "description": "A juicy beef burger with all the fixings.",
      "price": 14.00,
      "category": "Main",
      "imageUrl": "https://example.com/burger.jpg",
      "availability": "available",
      "version": 3
    }
    ```

### Mark Menu Item as Out of Stock (Staff)
-   **PUT** `/api/menu/:id/out-of-stock`
-   **Description**: Marks a specific menu item as "out_of_stock". Requires staff authentication.
-   **Requires**: Authentication as a staff user.
-   **Path Parameter**:
    -   `id`: The ID of the menu item to update.
-   **Request Body**: None.
-   **Response**: `200 OK`
    ```json
    {
      "id": "menuItemId",
      "name": "Delicious Burger",
      "description": "A juicy beef burger with all the fixings.",
      "price": 12.99,
      "category": "Main",
      "imageUrl": "https://example.com/burger.jpg",
      "availability": "out_of_stock",
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

### MenuItemCreated
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  availability: string;
  version: number;
}
```

### MenuItemUpdated
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  availability: string;
  version: number;
}
```

## Model Methods

The MenuItem model includes the following methods:
- `updatePrice(newPrice: number)`: Updates the price of a menu item
- `markAsOutOfStock()`: Marks a menu item as out of stock

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
docker build -t smartdine/menu .
```

Run the container:
```bash
docker run -p 3000:3000 smartdine/menu
``` 

## Project Structure
```
menu/
├── src/
│   ├── app.ts                # Express app setup
│   ├── index.ts              # Service entry point
│   ├── routes/               # Route handlers
│   │   ├── get-menu.ts       # Retrieve all menu items route
│   │   ├── get-menu-item.ts  # Retrieve a single menu item route
│   │   ├── create-menu.ts    # Create a new menu item route
│   │   ├── update-menu.ts    # Update menu item details route
│   │   ├── update-price.ts   # Update menu item price route
│   │   └── mark-out-of-stock.ts # Mark menu item as out of stock route
│   ├── events/               # Event listeners and publishers
│   │   ├── publishers/
│   │   │   ├── menu-item-created-publisher.ts # Publishes MenuItemCreated events
│   │   │   └── menu-item-updated-publisher.ts # Publishes MenuItemUpdated events
│   │   └── listeners/
│   │       └── some-event-listener.ts         # Example listener (if needed)
│   ├── models/               # Data models
│   │   └── menu-item.ts      # MenuItem model
│   ├── test/                 # Test setup and utilities
│   │   ├── setup.ts          # Test environment setup
│   │   └── menu.test.ts      # Unit tests for menu functionality
│   ├── utils/                # Utility functions
│   │   └── validate-request.ts # Middleware to validate requests
│   ├── nats-wrapper.ts       # NATS client wrapper
│   ├── mongo-client.ts       # MongoDB client setup
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── Dockerfile                # Docker configuration
├── .env                      # Environment variables
├── README.md                 # Documentation for the service
```
* * * * *