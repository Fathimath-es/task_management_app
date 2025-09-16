# Stage 1: Build the React application
# This stage uses a Node.js image to compile your React code into static
# HTML, CSS, and JavaScript files, which are the final assets for your app.
FROM node:18-alpine AS builder

# Set the working directory inside the container.
WORKDIR /app

# Copy the package.json and package-lock.json files first.
# This helps with caching layers and speeds up future builds.
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend source code.
COPY . .

# Run the build command to create the production-ready assets.
RUN npm run build

# Stage 2: Serve the application with Nginx
# This stage creates a small, production-ready image.
FROM nginx:alpine

# Copy the custom Nginx configuration file into the container. This
# file is crucial for a single-page app's routing to work correctly.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled build files from the 'builder' stage into the Nginx
# web root directory.
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80, which is the default port for web traffic.
EXPOSE 80

# This is the command that starts the Nginx server.
CMD ["nginx", "-g", "daemon off;"]
