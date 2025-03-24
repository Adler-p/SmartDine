# Authentication Service

This service handles user authentication and authorization for the SmartDine application.

## API Endpoints

### User Registration
- **POST** `/api/users/signup`
- Creates a new user account
- Request Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name",
    "role": "customer" | "staff"
  }
  ```
- Validation:
  - Email must be valid and unique
  - Password must be between 4 and 20 characters
  - Name is required
  - Role must be either "customer" or "staff"
- Response: 201 Created
  ```json
  {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "customer"
  }
  ```

### User Login
- **POST** `/api/users/signin`
- Authenticates an existing user
- Request Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response: 200 OK
  ```json
  {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "customer"
  }
  ```

### Current User
- **GET** `/api/users/currentuser`
- Returns information about the currently logged-in user
- Requires: Valid session cookie
- Response: 200 OK
  ```json
  {
    "currentUser": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "customer"
    }
  }
  ```

### Sign Out
- **POST** `/api/users/signout`
- Logs out the current user by clearing their session
- Response: 200 OK
  ```json
  {}
  ```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "errors": [
    {
      "message": "Error message",
      "field": "field_name" // Optional
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
   - Passwords are hashed using scrypt with a random salt
   - Original passwords are never stored

2. Session Management
   - JWT-based authentication
   - Secure cookie session storage
   - HTTPS-only cookies in production

3. Input Validation
   - Email format validation
   - Password length requirements
   - Role validation
   - Request body validation

## Environment Variables

- `JWT_KEY`: Secret key for JWT signing (required)
- `MONGO_URI`: MongoDB connection string
- `NATS_URL`: NATS streaming server URL
- `NATS_CLUSTER_ID`: NATS streaming cluster ID
- `NATS_CLIENT_ID`: NATS streaming client ID

## Events Published

### UserCreated
```typescript
{
  id: string;
  email: string;
  role: string;
  name: string;
  version: number;
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

## Overview
The Authentication Service is a microservice responsible for user authentication and authorization in the SmartDine system. It handles user registration, login, and role-based access control for both customers and restaurant staff.

## Features
- User registration with role selection (Customer/Staff)
- Secure authentication using JWT
- Role-based access control
- Session management
- Event publishing for user-related events

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
│   ├── index.ts           # Service entry point
│   ├── app.ts            # Express app setup
│   ├── models/           # Data models
│   │   └── user.ts       # User model
│   ├── routes/           # API routes
│   │   ├── current-user.ts
│   │   ├── signin.ts
│   │   ├── signout.ts
│   │   └── signup.ts
│   ├── events/           # Event handlers
│   │   ├── publishers/
│   │   └── listeners/
│   ├── services/         # Business logic
│   │   └── password.ts   # Password hashing
│   └── test/            # Test setup and helpers
├── package.json
└── tsconfig.json
```

## Development

### Installation
```bash
pnpm install
```

### Running Tests
```bash
pnpm test
```

### Starting the Service
```bash
pnpm start
```

## Testing
The service includes comprehensive test coverage for:
- Route handlers
- Middleware functions
- Event publishers
- Authentication logic

## Error Handling
The service implements standardized error handling for:
- Validation errors
- Authentication errors
- Database errors
- Not found errors
- Bad request errors

## Security
- Password hashing using scrypt
- JWT-based authentication
- Session management with cookie-session
- Role-based access control
- Request validation

## Event Publishing
The service publishes events when:
- A new user is created
- A user's details are updated
- A user is deleted

These events are consumed by other services that need to react to user-related changes.

---

# 认证服务

## 概述
认证服务是 SmartDine 系统中负责用户认证和授权的微服务。它处理用户注册、登录，以及针对顾客和餐厅员工的基于角色的访问控制。

## 功能特性
- 支持角色选择的用户注册（顾客/员工）
- 使用 JWT 的安全认证
- 基于角色的访问控制
- 会话管理
- 用户相关事件发布

## API 接口

### POST /api/users/signup
注册新用户
```json
{
  "email": "user@example.com",
  "password": "password",
  "name": "用户名",
  "role": "customer|staff"
}
```

### POST /api/users/signin
用户登录
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### POST /api/users/signout
用户登出

### GET /api/users/currentuser
获取当前用户信息

## 事件发布
- 用户创建事件
- 用户更新事件
- 用户删除事件

## 技术栈
- Node.js 与 TypeScript
- Express.js 框架
- MongoDB 与 Mongoose
- NATS Streaming 消息队列
- Jest 测试框架

## 项目结构
```
auth/
├── src/
│   ├── index.ts           # 服务入口点
│   ├── app.ts            # Express应用设置
│   ├── models/           # 数据模型
│   │   └── user.ts       # 用户模型
│   ├── routes/           # API路由
│   │   ├── current-user.ts
│   │   ├── signin.ts
│   │   ├── signout.ts
│   │   └── signup.ts
│   ├── events/           # 事件处理
│   │   ├── publishers/
│   │   └── listeners/
│   ├── services/         # 业务逻辑
│   │   └── password.ts   # 密码哈希
│   └── test/            # 测试设置和辅助函数
├── package.json
└── tsconfig.json
```

## 环境变量
- JWT_KEY: JWT 签名密钥
- MONGO_URI: MongoDB 连接字符串
- NATS_URL: NATS 流服务器地址
- NATS_CLUSTER_ID: NATS 集群 ID
- NATS_CLIENT_ID: NATS 客户端 ID

## 开发

### 安装
```bash
pnpm install
```

### 运行测试
```bash
pnpm test
```

### 启动服务
```bash
pnpm start
```

## 测试
服务包含全面的测试覆盖：
- 路由处理器
- 中间件函数
- 事件发布器
- 认证逻辑

## 错误处理
服务实现了标准化的错误处理：
- 验证错误
- 认证错误
- 数据库错误
- 未找到错误
- 错误请求

## 安全性
- 使用 scrypt 进行密码哈希
- 基于 JWT 的认证
- 使用 cookie-session 的会话管理
- 基于角色的访问控制
- 请求验证

## 事件发布
服务在以下情况下发布事件：
- 新用户创建
- 用户详情更新
- 用户删除

这些事件会被需要响应用户相关变更的其他服务消费。 