FROM node:18-alpine AS builder

WORKDIR /app

# Copy all package.json files
COPY package*.json ./
COPY common/package*.json ./common/
COPY payments/package*.json ./payments/

# Build common package
WORKDIR /app/common
COPY common/ ./
RUN npm install
RUN npm run build

# Build payments service
WORKDIR /app/payments
COPY payments/ ./
# npm install will automatically resolve file:../common
RUN npm install
RUN npm run build

# Production environment image
FROM node:18-alpine

WORKDIR /app

# Copy common package
COPY --from=builder /app/common /app/common

# Copy payments service
WORKDIR /app/payments
COPY --from=builder /app/payments/package.json ./
COPY --from=builder /app/payments/node_modules ./node_modules
COPY --from=builder /app/payments/dist ./dist

# Create a symbolic link from payments/node_modules/@smartdine/common to /app/common
RUN mkdir -p /app/payments/node_modules/@smartdine && \
    ln -sf /app/common /app/payments/node_modules/@smartdine/common

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"] 