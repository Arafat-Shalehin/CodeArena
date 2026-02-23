#!/bin/bash

echo "================================================"
echo "  CodeArena - Docker Implementation Setup"
echo "================================================"
echo ""

# Check Docker
echo "Step 1: Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check Node.js
echo "Step 2: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js is installed: $NODE_VERSION"
echo ""

# Install dependencies
echo "Step 3: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build Docker images
echo "Step 4: Building Docker executor images..."
echo "This may take 5-10 minutes..."
echo ""

cd docker/scripts

# Build C++ image
echo "Building C++ executor..."
docker build -f ../executors/Dockerfile.cpp -t codearena-executor-cpp:latest ../executors/ || {
    echo "❌ Failed to build C++ image"
    exit 1
}

# Build Python image
echo "Building Python executor..."
docker build -f ../executors/Dockerfile.python -t codearena-executor-python:latest ../executors/ || {
    echo "❌ Failed to build Python image"
    exit 1
}

# Build Java image
echo "Building Java executor..."
docker build -f ../executors/Dockerfile.java -t codearena-executor-java:latest ../executors/ || {
    echo "❌ Failed to build Java image"
    exit 1
}

# Build JavaScript image
echo "Building JavaScript executor..."
docker build -f ../executors/Dockerfile.javascript -t codearena-executor-javascript:latest ../executors/ || {
    echo "❌ Failed to build JavaScript image"
    exit 1
}

# Build Go image
echo "Building Go executor..."
docker build -f ../executors/Dockerfile.go -t codearena-executor-go:latest ../executors/ || {
    echo "❌ Failed to build Go image"
    exit 1
}

cd ../..

echo ""
echo "✅ All Docker images built successfully!"
echo ""

# Verify images
echo "Step 5: Verifying images..."
docker images | grep codearena-executor
echo ""

# Create .env file if not exists
if [ ! -f .env.local ]; then
    echo "Step 6: Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created"
else
    echo "Step 6: .env.local already exists"
fi
echo ""

# Done
echo "================================================"
echo "  ✅ Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Start development server: npm run dev"
echo "  2. Visit http://localhost:3000/test-docker"
echo "  3. Test code execution with different languages"
echo ""
echo "Useful commands:"
echo "  - npm run dev          : Start development server"
echo "  - npm run docker:build : Rebuild Docker images"
echo "  - npm run docker:cleanup : Clean up Docker resources"
echo ""
echo "Documentation:"
echo "  - README.md            : Project overview"
echo "  - DOCKER_GUIDE.md      : Detailed Docker guide"
echo "  - IMPLEMENTATION_SUMMARY.md : Implementation details"
echo ""
echo "Happy coding! 🚀"
