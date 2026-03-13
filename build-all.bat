@echo off
echo Building Executors...
docker build -f docker/executors/Dockerfile.cpp -t codearena-executor-cpp:latest docker/executors/
docker build -f docker/executors/Dockerfile.python -t codearena-executor-python:latest docker/executors/
docker build -f docker/executors/Dockerfile.java -t codearena-executor-java:latest docker/executors/
docker build -f docker/executors/Dockerfile.javascript -t codearena-executor-javascript:latest docker/executors/

echo Starting CodeArena App...
docker compose up -d --build app