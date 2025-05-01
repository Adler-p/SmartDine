# Authentication Service

The Auth Service is responsible for handling user authentication and session management in the SmartDine application. It provides endpoints for user signup, signin, signout, session creation, and token refresh.

## Features
- User authentication for staff (signup, signin, signout)
- Session management for customers (using cookies)
- Refresh token support for secure and scalable authentication (frontend will check token expiry and trigger this endpoint to refresh token)
- Event publishing for user-related events

These events are consumed by other services that need to react to user-related changes.

## API Endpoints

### User Registration (Staff)
-   **POST** `/api/users/signup`
-   **Description**: Creates a new user account.
-   **Request Body**:
    ```json
    {
      "email": "don@example.com", 
      "password": "12345", 
      "name": "Don", 
      "role": "staff"
    }
    ```
-   **Validation**:
    -   `email`: Must be valid and unique.
    -   `password`: Must be between 4 and 20 characters.
    -   `name`: Required.
    -   `role`: Must be `"staff"` (future enhancements may introduce other roles).
-   **Response**: `201 Created`
    ```json
    {
      "accessToken": "accessToken", 
      "user": {
        "id": "user_id", 
        "email": "don@example.com", 
        "name": "Don", 
        "role": "staff"
      }
    }
    ```
### User Login (Staff)
-   **POST** `/api/users/signin`
-   **Description**: Authenticates an existing user.
-   **Request Body**:
    ```json
    {
      "email": "don@example.com", 
      "password": "12345"
    }
    ```
-   **Validation**:
    -   `email`: Must be valid.
    -   `password`: Required.
-   **Response**: `200 OK`
    ```json
    {
      "accessToken": "accessToken", 
      "user": {
        "id": "user_id", 
        "email": "don@example.com", 
        "name": "Don", 
        "role": "staff"
      }
    }
    ```
### Sign Out (Staff)
-   **POST** `/api/users/signout`
-   **Description**: Logs out the current user by clearing their session.
-   **Request Body**: None.
-   **Response**: `200 OK`
    ```json
    {}
    ```
### Current User (Staff)
-   **GET** `/api/users/currentuser`
-   **Description**: Returns information about the currently logged-in user.
-   **Requires**: Valid session cookie.
-   **Request Body**: None.
-   **Response**: `200 OK`
    ```json
    {
      "currentUser": {
        "id": "user_id", 
        "email": "don@example.com", 
        "name": "Don", 
        "role": "staff"
      }
    }
    ```
### Refresh Token (Staff)
-   **POST** `/api/users/refresh-token`
-   **Description**: Refreshes the user's access token using a refresh token.
-   **Request Body**: None. Refresh token is expected as an HTTP-only, secure cookie named `refreshToken`. 
-   **Validation**:
    -   The `refreshToken` cookie must be valid, not expired, and exist in the database.
-   **Response**: `200 OK`
    ```json
    {
      "accessToken": "new_access_token"
    }
    ```
-   **Response Headers**: A new `refreshToken` is set as an HTTP-only, secure cookie in the `Set-Cookie` header. 

### New Session for Customer
-   **GET** `/api/session/create?role=customer&tableId=table123`
-   **Description**: Creates a new session for a customer.
-   **Query Parameters**:
    -   `role`: Role of the user (e.g., `"customer"`).
    -   `tableId`: ID of the table.
-   **Validation**:
    -   `role`: Required.
    -   `tableId`: Required.
-   **Response**: Redirects to the frontend with the session ID in the query parameters.
    -   Example Redirect URL:
    ```json
    https://nus-iss-smart-dine.vercel.app/menu?tableId=table123&sessionId=session12345566
    ```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "errors": [
    {
      "message": "Error message",
      "field": "field_name"    // Optional
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

## Security Features

1. Password Hashing
   - Passwords are hashed using `scrypt` with a unique, randomly generated salt for each password
   - Original passwords are never stored

2. Session Management
   - JWT-based authentication for access tokens
   - Secure cookie session storage for access and refresh tokens
   - `HttpOnly` flags set on cookies to prevent client-side script access
   - `Secure` flag set on cookies to ensure transmission only over HTTPS 
   - Refresh Token Rotation implemented

3. Input Validation
   - Email format validation
   - Password length requirements
   - Role validation
   - Request body validation

## Environment Variables

- `JWT_KEY`: Secret key for JWT signing (required)
- `NATS_URL`: NATS streaming server URL
- `NATS_CLUSTER_ID`: NATS streaming cluster ID
- `NATS_CLIENT_ID`: NATS streaming client ID
- `POSTGRES_URI`: POSTGRES connection string 

## Events Published

### `session:created`
-   **Description**: Published when a new customer session is successfully created. This happens after a customer initiates a session upon scanning the QR code on the table. 
-   **Event Listener**: [SessionCreatedPublisher]
-   **Event Data:**
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

### `user:created`
-   **Description**: Published when a new user account is successfully created (only for staff). 
-   **Event Listener**: [UserCreatedPublisher]
-   **Event Data:**
    ```json
    {
      "subject": "user:created",
      "data": {
        "id": "user-5e7a2b9c1d3e4f5a6b7c8d9e",
        "email": "newstaff@example.com",
        "name": "New Staff Member",
        "role": "staff"
      }
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
docker build -t smartdine/auth .
```

Run the container:
```bash
docker run -p 3000:3000 smartdine/auth
```

## Technical Stack
- Node.js with TypeScript
- Express.js
- MongoDB with Mongoose
- NATS Streaming for event bus
- Jest for testing

## Project Structure
```
auth/
├── src/
│   ├── app.ts                # Express app setup
│   ├── index.ts              # Service entry point
│   ├── routes/               # Route handlers
│   │   ├── current-user.ts   # Current user route
│   │   ├── signin.ts         # Signin route
│   │   ├── signout.ts        # Signout route
│   │   ├── signup.ts         # Signup route
│   │   ├── new-session.ts    # Session creation route
│   │   └── refresh-token.ts  # Refresh token route
│   ├── models/               # Database models
│   ├── events/               # Event publishers and listeners
│   ├── middlewares/          # Custom middleware
│   ├── utils/                # Utility functions
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── Dockerfile                # Docker configuration
├── .env                      # Environment variables
```