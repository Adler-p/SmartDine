# Menu Service

This service handles menu item management for the SmartDine application.

## API Endpoints

### List All Menu Items
- **GET** `/api/menu`
- Returns all menu items
- Optional query parameter: `available=true` to filter only available items
- Requires: Authentication (Staff or Customer)
- Response: 200 OK
  ```json
  [
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
  ]
  ```

### Get Menu Items by Category
- **GET** `/api/menu/category/:category`
- Returns menu items in a specific category
- Requires: Authentication (Staff or Customer)
- Response: 200 OK
  ```json
  [
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
  ]
  ```

### Get Single Menu Item
- **GET** `/api/menu/:id`
- Returns details of a specific menu item
- Requires: Authentication (Staff or Customer)
- Response: 200 OK
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

### Create Menu Item
- **POST** `/api/menu`
- Creates a new menu item
- Requires: Authentication (Staff only)
- Request Body:
  ```json
  {
    "name": "Item Name",
    "description": "Item Description",
    "price": 10.99,
    "category": "Category",
    "imageUrl": "https://example.com/image.jpg",
    "availability": "available"
  }
  ```
- Validation:
  - Name is required
  - Description is required
  - Price must be greater than 0
  - Category is required
  - Image URL must be a valid URL (optional)
  - Availability must be either "available" or "out_of_stock" (optional, defaults to "available")
- Response: 201 Created

### Update Menu Item
- **PUT** `/api/menu/:id`
- Updates an existing menu item
- Requires: Authentication (Staff only)
- Request Body (all fields optional):
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
- Validation:
  - Name cannot be empty if provided
  - Description cannot be empty if provided
  - Price must be greater than 0 if provided
  - Category cannot be empty if provided
  - Image URL must be valid if provided
  - Availability must be either "available" or "out_of_stock" if provided
- Response: 200 OK

### Update Menu Item Availability
- **PATCH** `/api/menu/:id/availability`
- Updates the availability status of a menu item
- Requires: Authentication (Staff only)
- Request Body:
  ```json
  {
    "availability": "available" | "out_of_stock"
  }
  ```
- Response: 200 OK

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