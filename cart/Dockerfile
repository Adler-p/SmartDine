# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . ./

# Build the TypeScript code
RUN npm run build

# Expose the port the service will run on
EXPOSE 3002

# Start the application
CMD ["npm", "start"]