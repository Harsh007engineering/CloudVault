# Multi-stage Dockerfile for CloudVault Production
# Stage 1: Build the React + Vite frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Node.js server
FROM node:20-alpine
WORKDIR /app

# Install server production dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server application code
COPY server/ ./server/

# Copy compiled frontend from client-builder into client/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Expose default application port
ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

# Set working directory to server and start
WORKDIR /app/server
CMD ["node", "src/server.js"]
