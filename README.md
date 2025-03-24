# SmartDine - Restaurant Management System

A microservices-based restaurant management system built with Node.js and TypeScript.

## System Architecture

The system consists of the following microservices:

- **Auth Service**: User authentication and authorization
  - User registration and login
  - Role-based access control (Customer/Staff)
  - Session management

- **Menu Service**: Menu management
  - Menu item CRUD operations
  - Category management
  - Availability tracking

- **Order Service**: Order management
  - Order creation and tracking
  - Status updates (Created → AwaitingPreparation → InPreparation → Ready → Completed)
  - Order history

- **Payment Service**: Payment processing
  - Payment creation and processing
  - Status tracking (Created → Pending → Completed/Failed)
  - Refund handling

- **Kitchen Service**: Kitchen order management
  - Order queue management
  - Preparation status updates
  - Real-time order tracking

- **Notification Service**: Notification handling
  - Order status notifications
  - Payment confirmations
  - System alerts

## Technical Stack

- **Backend**:
  - Node.js & TypeScript
  - Express.js
  - MongoDB (Database)
  - NATS Streaming (Message Queue)
  - Jest (Testing)

- **Infrastructure**:
  - Docker & Kubernetes
  - NGINX (API Gateway)
  - Redis (Caching)

## Project Structure

```
smartdine/
├── auth/           # Authentication service
├── menu/           # Menu service
├── orders/         # Order service
├── payments/       # Payment service
├── kitchen/        # Kitchen service
├── notification/   # Notification service
├── common/         # Shared library
└── client/         # Frontend application
```

## API Documentation

### Auth Service API
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/signin` - User login
- POST `/api/auth/signout` - User logout
- GET `/api/auth/currentuser` - Get current user info

### Menu Service API
- GET `/api/menu` - List all menu items
- GET `/api/menu/:id` - Get menu item details
- POST `/api/menu` - Create menu item (Staff only)
- PUT `/api/menu/:id` - Update menu item (Staff only)
- DELETE `/api/menu/:id` - Delete menu item (Staff only)

### Order Service API
- POST `/api/orders` - Create new order
- GET `/api/orders` - List user's orders
- GET `/api/orders/:id` - Get order details
- PUT `/api/orders/:id/status` - Update order status (Staff only)
- DELETE `/api/orders/:id` - Cancel order

### Payment Service API
- POST `/api/payments` - Create payment
- GET `/api/payments/:id` - Get payment details
- GET `/api/payments` - List payments (Staff only)
- PUT `/api/payments/:id/status` - Update payment status
- POST `/api/payments/:id/refund` - Process refund (Staff only)

### Kitchen Service API
- GET `/api/kitchen/orders` - Get active orders
- PUT `/api/kitchen/orders/:id/status` - Update preparation status
- GET `/api/kitchen/queue` - Get order queue

### Notification Service API
- POST `/api/notifications/subscribe` - Subscribe to notifications
- GET `/api/notifications` - Get user notifications
- PUT `/api/notifications/:id/read` - Mark notification as read

## Message Queue Events

The system uses NATS Streaming for event communication:

### Order Events
- `order:created` - New order created
- `order:cancelled` - Order cancelled
- `order:status-updated` - Order status changed

### Payment Events
- `payment:created` - Payment initiated
- `payment:completed` - Payment successful
- `payment:failed` - Payment failed
- `payment:refunded` - Payment refunded

### Menu Events
- `menu:item:created` - New menu item added
- `menu:item:updated` - Menu item updated
- `menu:item:deleted` - Menu item removed

### User Events
- `user:created` - New user registered
- `user:updated` - User profile updated
- `user:deleted` - User account deleted

## Development Setup

1. Prerequisites:
   - Node.js (v16 or higher)
   - Docker and Docker Compose
   - Kubernetes (optional)
   - NATS Streaming Server
   - MongoDB

2. Install dependencies:
```bash
pnpm install
```

3. Start development environment:
```bash
pnpm start
```

4. Run tests:
```bash
pnpm test
```

## Environment Variables

Each service requires the following environment variables:

```env
MONGO_URI=mongodb://localhost:27017/service-name
NATS_URL=http://localhost:4222
NATS_CLUSTER_ID=smartdine
NATS_CLIENT_ID=unique-client-id
JWT_KEY=your-secret-key
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
