# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# 先复制所有package.json文件
COPY package*.json ./
COPY common/package*.json ./common/
COPY auth/package*.json ./auth/

# 构建common包
WORKDIR /app/common
COPY common/ ./
RUN npm install
RUN npm run build

# 构建auth服务
WORKDIR /app/auth
COPY auth/ ./
# 使用npm install会自动解析file:../common路径
RUN npm install
RUN npm run build

# 生产环境镜像
FROM node:18-alpine

WORKDIR /app

# 复制common包
COPY --from=builder /app/common /app/common

# 复制auth服务
WORKDIR /app/auth
COPY --from=builder /app/auth/package.json ./
COPY --from=builder /app/auth/node_modules ./node_modules
COPY --from=builder /app/auth/dist ./dist

# 创建从auth/node_modules/@smartdine/common到/app/common的符号链接
RUN mkdir -p /app/auth/node_modules/@smartdine && \
    ln -sf /app/common /app/auth/node_modules/@smartdine/common

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "dist/index.js"]