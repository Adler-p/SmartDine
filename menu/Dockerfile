# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# 先复制所有package.json文件
COPY package*.json ./
COPY common/package*.json ./common/
COPY menu/package*.json ./menu/

# 构建common包
WORKDIR /app/common
COPY common/ ./
RUN npm install
RUN npm run build

# 构建menu服务
WORKDIR /app/menu
COPY menu/ ./
# 使用npm install会自动解析file:../common路径
RUN npm install
# 添加构建步骤
RUN npm run build

# 生产环境镜像 - 使用同一个镜像，不再分阶段
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 启动应用 - 使用node运行编译后的JavaScript
CMD ["node", "/app/menu/dist/index.js"] 