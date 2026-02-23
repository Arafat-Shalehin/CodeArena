#!/bin/bash

# Cleanup old containers and images
echo "Cleaning up CodeArena Docker resources..."

# Stop and remove all running executor containers
echo "Stopping containers..."
docker ps -a | grep codearena-executor | awk '{print $1}' | xargs -r docker stop
docker ps -a | grep codearena-executor | awk '{print $1}' | xargs -r docker rm

# Remove dangling images
echo "Removing dangling images..."
docker images -f "dangling=true" -q | xargs -r docker rmi

# Remove old executor images (optional)
# Uncomment to remove all executor images
# docker images | grep codearena-executor | awk '{print $3}' | xargs -r docker rmi

# Clean up Docker system
echo "Running Docker system prune..."
docker system prune -f

echo "Cleanup completed!"
