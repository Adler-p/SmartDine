# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# 先复制所有package.json文件
COPY package*.json ./
COPY common/package*.json ./common/
COPY cart/package*.json ./cart/

# 构建common包
WORKDIR /app/common
COPY common/ ./
RUN npm install
RUN npm run build

# 构建 cart 服务
WORKDIR /app/cart
COPY cart/ ./
# 使用npm install会自动解析file:../common路径
RUN npm install
# 添加构建步骤
RUN npm run build

# 生产环境镜像
FROM node:18-alpine

WORKDIR /app

# 复制common包
COPY --from=builder /app/common /app/common

# 复制 cart 服务
WORKDIR /app/cart
COPY --from=builder /app/cart/package.json ./
COPY --from=builder /app/cart/node_modules ./node_modules
COPY --from=builder /app/cart/dist ./dist

# 创建从 cart/node_modules/@smartdine/common到/app/common的符号链接
RUN mkdir -p /app/cart/node_modules/@smartdine && \
    ln -sf /app/common /app/cart/node_modules/@smartdine/common

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "dist/index.js"]