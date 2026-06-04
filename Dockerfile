# Use official Nginx image as the base
FROM nginx:alpine

# Cloud Run requires the container to listen on the port defined by the PORT environment variable.
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Copy the built application from the app/dist directory
COPY app/dist /usr/share/nginx/html

# Ensure the Nginx entrypoint only substitutes the PORT variable
ENV NGINX_ENVSUBST_FILTER=PORT
