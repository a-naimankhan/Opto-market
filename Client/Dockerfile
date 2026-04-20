# Use the official Node.js image as the base image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 4200

# Command to run the application
CMD ["node_modules/.bin/ng", "serve", "optomarket_front", "--host", "0.0.0.0", "--port", "4200"]
