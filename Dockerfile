# Use official Node 23 image from Docker Hub
FROM node:23.1

# Set working directory inside the container
WORKDIR /app

# Install system dependencies (if you need Python, Git, etc. uncomment below)
# RUN apt-get update && apt-get install -y python3 python3-pip git

# Copy package.json and package-lock.json first for better Docker cache
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of your app code into the container
COPY . .

# Expose the default Next.js port
EXPOSE 3000

# Start the Next.js development server
CMD ["npm", "run", "dev"]
