#!/bin/bash

# Build all Docker executor images
echo "Building CodeArena Docker executor images..."

# Navigate to docker directory
cd "$(dirname "$0")/.."

# Build each language image
echo "Building C++ executor..."
docker build -f executors/Dockerfile.cpp -t codearena-executor-cpp:latest executors/

echo "Building Python executor..."
docker build -f executors/Dockerfile.python -t codearena-executor-python:latest executors/

echo "Building Java executor..."
docker build -f executors/Dockerfile.java -t codearena-executor-java:latest executors/

echo "Building JavaScript executor..."
docker build -f executors/Dockerfile.javascript -t codearena-executor-javascript:latest executors/

echo "All images built successfully!"
echo ""
echo "Available images:"
docker images | grep codearena-executor
