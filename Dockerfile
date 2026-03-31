# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy backend
COPY Backend ./Backend

# Copy frontend
COPY Frontend ./Frontend

# Install backend deps
WORKDIR /app/Backend
RUN npm install

# Install frontend deps
WORKDIR /app/Frontend
RUN npm install
RUN npm run build

# Expose port (adjust if needed)
EXPOSE 3000

# Start backend (change if needed)
WORKDIR /app/Backend
CMD ["npm", "start"]
