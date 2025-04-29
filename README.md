# SmartDine - Restaurant Management System

A microservices-based restaurant management system built with Node.js and TypeScript.

## System Architecture

The system consists of the following microservices:

- **Auth Service**: User authentication and authorization

  - User registration and login
  - Role-based access control (Customer/Staff)
  - Session management with JWT

- **Menu Service**: Menu management

  - Menu item CRUD operations
  - Category filtering
  - Availability tracking

- **Order Service**: Order management

  - Order creation and tracking
  - Status updates (Created → AwaitingPreparation → InPreparation → Ready → Completed)
  - Order history and filtering
  - Order expiration handling

- **Payment Service**: Payment processing
  - Payment creation and processing
  - Status tracking (Created → Pending → Completed/Failed/Refunded)
  - Payment history

## Technical Stack

- Node.js & TypeScript
- Express.js
- MongoDB (Database)
- NATS Streaming (Message Queue)
- Docker & Kubernetes
- Jest (Testing)

## Project Structure

```
smartdine/
├── auth/           # Authentication service
├── menu/           # Menu service
├── orders/         # Order service
├── payments/       # Payment service
├── common/         # Shared library
└── client/         # Frontend application
```

## API Documentation

### Auth Service API

- POST `/api/users/signup` - Register new user (email, password, name, role)
- POST `/api/users/signin` - User login (email, password)
- POST `/api/users/signout` - User logout
- GET `/api/users/currentuser` - Get current user info

### Menu Service API

- GET `/api/menu` - List all menu items (optional filter: available=true)
- GET `/api/menu/category/:category` - Get menu items by category
- GET `/api/menu/:id` - Get menu item details
- POST `/api/menu` - Create menu item (Staff only)
- PUT `/api/menu/:id` - Update menu item (Staff only)
- PATCH `/api/menu/:id/availability` - Update menu item availability (Staff only)

### Order Service API

- POST `/api/orders` - Create new order (Customer only)
- GET `/api/orders` - List user's orders (Customer only)
- GET `/api/orders/staff` - List all orders (Staff only)
- GET `/api/orders/:orderId` - Get order details
- PUT `/api/orders/:orderId/status` - Update order status (Staff only)
- DELETE `/api/orders/:orderId` - Cancel order (Customer only)

### Payment Service API

- POST `/api/payments` - Create payment (Order owner only)
- GET `/api/payments/:id` - Get payment details (Payment owner only)
- GET `/api/payments` - List all payments (Staff only)
- PUT `/api/payments/:id/status` - Update payment status (Staff only)

## Message Queue Events

The system uses NATS Streaming for event communication:

### Order Events

- `order:created` - New order created
- `order:cancelled` - Order cancelled

### Payment Events

- `payment:created` - Payment initiated
- `payment:updated` - Payment status updated

### Menu Events

- `menu:item:created` - New menu item added
- `menu:item:updated` - Menu item updated

### User Events

- `user:created` - New user registered
- `user:updated` - User profile updated
- `user:deleted` - User account deleted

### Expiration Events

- `expiration:complete` - Order time limit reached

## Event Listeners

- **Orders Service**:

  - Listens for `payment:created` to update order status
  - Listens for `expiration:complete` to cancel expired orders

- **Payments Service**:
  - Listens for `order:created` to track valid orders
  - Listens for `order:cancelled` to prevent payment for cancelled orders

## Development Setup

1. Prerequisites:

   - Node.js (v16 or higher)
   - Docker and Docker Compose
   - Kubernetes (optional)
   - NATS Streaming Server
   - MongoDB
   - postgreSQL

2. run docker compose
   docker-compose build && docker-compose up -d

````

## Environment Variables

Each service requires the following environment variables:

```env
MONGO_URI=mongodb://localhost:27017/service-name
NATS_URL=http://localhost:4222
NATS_CLUSTER_ID=smartdine
NATS_CLIENT_ID=unique-client-id
JWT_KEY=your-secret-key
````

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
