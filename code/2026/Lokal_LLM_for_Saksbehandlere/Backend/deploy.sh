#!/bin/bash

# Automated deployment script for lokal-llm backend
# This script is called by GitHub Actions to deploy updates
# Test CICD

set -e  # Exit on any error

echo "Starting automated deployment for lokal-llm"

# Configuration
DEPLOY_DIR="$HOME/lokal-llm"
IMAGE_NAME="ghcr.io/krsgeodata/801_26_lokal-llm/backend:latest"
CONTAINER_NAME="lokal-llm-backend"

# Create deploy directory if it doesn't exist
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# Creates the storage on vm if it doesn't exist
mkdir -p "$DEPLOY_DIR/storage"

# gives read and write permissions
chmod 770 "$DEPLOY_DIR/storage" || true
echo "Working in: $(pwd)"

# Stop existing container if running
echo "Stopping existing container..."
docker compose down || echo "No container was running"

# Pull latest Docker image
echo "Pulling latest Docker image..."
docker pull "$IMAGE_NAME"

# Write docker-compose.yml
echo "Writing docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
services:
  backend:
    image: ghcr.io/krsgeodata/801_26_lokal-llm/backend:latest
    container_name: lokal-llm-backend
    ports:
      - "8001:8000"
    env_file:
      - .env
    volumes:
      - ./storage:/app/storage
    restart: unless-stopped
    networks:
      - geointernship25_network
      - atlas_network
    labels:
      - "traefik.enable=true"
  #  - "traefik.http.middlewares.lokal-llm-auth.basicauth.users=${TRAEFIK_AUTH}"
      - "traefik.http.middlewares.lokal-llm-login-rate.ratelimit.average=5"
      - "traefik.http.middlewares.lokal-llm-login-rate.ratelimit.burst=10"

      # Public login route (no BasicAuth)
      - "traefik.http.routers.lokal-llm-login-public.rule=Host(`lokal-llm.geokrs.no`) && Path(`/auth/login`)"
      - "traefik.http.routers.lokal-llm-login-public.entrypoints=web"
      - "traefik.http.routers.lokal-llm-login-public.priority=100"
      - "traefik.http.routers.lokal-llm-login-public.service=lokal-llm"
      - "traefik.http.routers.lokal-llm-login-public.middlewares=lokal-llm-login-rate"

      # Protected routes (BasicAuth)
      - "traefik.http.routers.lokal-llm-protected.rule=Host(`lokal-llm.geokrs.no`) && PathPrefix(`/`)"
      - "traefik.http.routers.lokal-llm-protected.entrypoints=web"
      - "traefik.http.routers.lokal-llm-protected.priority=10"
      - "traefik.http.routers.lokal-llm-protected.service=lokal-llm"
  #   - "traefik.http.routers.lokal-llm-protected.middlewares=lokal-llm-auth"

      # Service definition
      - "traefik.http.services.lokal-llm.loadbalancer.server.port=8000"
      - "traefik.docker.network=atlas_network"

networks:
  geointernship25_network:
    external: true
  atlas_network:
    external: true
EOF

# Start container with new image
echo "Starting container with latest image..."
docker compose up -d

# Wait for container to start
sleep 5

# Health check
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Container is running successfully!"
    echo "Backend available at:"
    echo "   - http://lokal-llm.geokrs.no/"
    echo "   - http://$(hostname -I | awk '{print $1}'):8001/"
    echo ""
    echo "Container status:"
    docker ps | grep "$CONTAINER_NAME"
else
    echo "Container failed to start!"
    echo "Container logs:"
    docker logs "$CONTAINER_NAME" || echo "No logs available"
    exit 1
fi

# Clean up old images
echo "Cleaning up old Docker images..."
docker image prune -f

echo "Deployment completed successfully!"
