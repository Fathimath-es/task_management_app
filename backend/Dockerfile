# Use the official Node.js 18 image as the base.
# Alpine is a very lightweight Linux distribution, which results in smaller image sizes.
FROM node:18-alpine

# Set the working directory inside the container. All subsequent commands
# will be executed from this directory.
WORKDIR /app

# Copy the package.json and package-lock.json files from your host machine
# into the working directory of the container. We do this first to leverage
# Docker's caching, so dependencies are not re-installed unless they change.
COPY package*.json ./

# Install the dependencies for your application.
RUN npm install

# Copy the rest of your backend source code into the container.
COPY . .

# Expose the port your Express.js server listens on. This doesn't actually
# publish the port; it just documents which port the application uses.
# The docker-compose.yml file will handle the actual port mapping.
EXPOSE 5001

# Define the command to run your server when the container starts.
CMD ["node", "app.js"]
