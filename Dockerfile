# Use Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all files (including server.js)
COPY . .

# Copy .env file if needed
COPY .env .env

# Expose the port your app runs on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
