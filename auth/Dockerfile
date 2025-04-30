# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy all package.json files first
COPY package*.json ./
COPY common/package*.json ./common/
COPY auth/package*.json ./auth/

# Build common package
WORKDIR /app/common
COPY common/ ./
RUN npm install
RUN npm run build

# Build auth service
WORKDIR /app/auth
COPY auth/ ./
# npm install will automatically resolve file:../common path
RUN npm install
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy common package
COPY --from=builder /app/common /app/common

# Copy auth service
WORKDIR /app/auth
COPY --from=builder /app/auth/package.json ./
COPY --from=builder /app/auth/node_modules ./node_modules
COPY --from=builder /app/auth/dist ./dist

# Create symbolic link from auth/node_modules/@smartdine/common to /app/common
RUN mkdir -p /app/auth/node_modules/@smartdine && \
    ln -sf /app/common /app/auth/node_modules/@smartdine/common

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]