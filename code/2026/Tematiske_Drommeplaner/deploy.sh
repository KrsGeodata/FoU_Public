#!/bin/bash

set -euo pipefail

echo "Starting automated deployment for mikro-drommeplan"

DEPLOY_DIR="$HOME/mikro-drommeplan"
BACKEND_IMAGE="ghcr.io/krsgeodata/801_26_mikro-drommeplan/backend:latest"
FRONTEND_IMAGE="ghcr.io/krsgeodata/801_26_mikro-drommeplan/frontend:latest"
DB_CONTAINER_NAME="mikro-drommeplan-db"

cd "$DEPLOY_DIR"

echo "Working in: $(pwd)"

if [ ! -f ".env" ]; then
  echo "Missing required file: .env"
  exit 1
fi

set -a
source .env
set +a

# Keep the production database name stable even if the VM .env was written with an old value.
POSTGRES_DB="mikro_drommeplan"
if grep -q '^POSTGRES_DB=' .env; then
  grep -v '^POSTGRES_DB=' .env > .env.tmp
  printf 'POSTGRES_DB=mikro_drommeplan\n' >> .env.tmp
  mv .env.tmp .env
else
  printf '\nPOSTGRES_DB=mikro_drommeplan\n' >> .env
fi

echo "Pulling latest images..."
docker pull "$BACKEND_IMAGE"
docker pull "$FRONTEND_IMAGE"

echo "Stopping existing containers..."
docker compose down || echo "No containers were running"

echo "Starting containers..."
docker compose up -d

if ! docker exec "$DB_CONTAINER_NAME" psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1; then
  echo "Creating missing database: $POSTGRES_DB"
  docker exec "$DB_CONTAINER_NAME" createdb -U "$POSTGRES_USER" "$POSTGRES_DB"
fi

echo "Waiting for database to stabilize..."
MAX_HEALTH_WAIT=90
HEALTH_WAITED=0
STABLE_COUNT=0

while [ $HEALTH_WAITED -lt $MAX_HEALTH_WAIT ] && [ $STABLE_COUNT -lt 3 ]; do
  if docker exec "$DB_CONTAINER_NAME" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; then
    STABLE_COUNT=$((STABLE_COUNT + 1))
    echo "Database healthy ($STABLE_COUNT/3 stable checks)..."
    if [ $STABLE_COUNT -lt 3 ]; then
      sleep 2
    fi
  else
    STABLE_COUNT=0
    sleep 1
  fi
  HEALTH_WAITED=$((HEALTH_WAITED + 1))
done

if [ $STABLE_COUNT -lt 3 ]; then
  echo "❌ Database did not stabilize!"
  docker logs "$DB_CONTAINER_NAME" | tail -30
  exit 1
fi

echo "✅ Database is stable and ready!"
echo "✅ Deployment completed successfully!"
echo ""
echo "Available at:"
echo "   Frontend: http://geokrs.no/mikro-drommeplan"
echo "   Backend:  http://geokrs.no/mikro-drommeplan/api"
echo ""
docker ps | grep "mikro-drommeplan" || true

echo ""
echo "Cleaning up old Docker images..."
docker image prune -f