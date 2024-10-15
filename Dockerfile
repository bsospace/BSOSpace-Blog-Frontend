# Use the latest official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the prisma directory first to avoid unnecessary rebuilds
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Update npm to the latest version
RUN npm install -g npm@latest

# Copy the rest of the application code
COPY . .

# Verify that the prisma directory and schema.prisma file are present in container
RUN ls -la ./prisma/

# Generate Prisma client using the schema file
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Start the Next.js application
CMD ["npm", "start"]
