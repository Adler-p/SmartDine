FROM node:18-alpine AS builder

WORKDIR /app

# 先复制所有package.json文件
COPY package*.json ./
COPY common/package*.json ./common/
COPY orders/package*.json ./orders/

# 构建common包
WORKDIR /app/common
COPY common/ ./
RUN npm install
RUN npm run build

# 构建orders服务
WORKDIR /app/orders
COPY orders/ ./
# 使用npm install会自动解析file:../common路径
RUN npm install
RUN npm run build

# 生产环境镜像
FROM node:18-alpine

WORKDIR /app

# 复制common包
COPY --from=builder /app/common /app/common

# 复制orders服务
WORKDIR /app/orders
COPY --from=builder /app/orders/package.json ./
COPY --from=builder /app/orders/node_modules ./node_modules
COPY --from=builder /app/orders/dist ./dist

# 创建从orders/node_modules/@smartdine/common到/app/common的符号链接
RUN mkdir -p /app/orders/node_modules/@smartdine && \
    ln -sf /app/common /app/orders/node_modules/@smartdine/common

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "dist/index.js"]