#!/bin/bash
set -e

echo "=== Starting zhonghui-competition backend ==="

# Run database migrations
echo "Running alembic migrations..."
cd /app
python -m alembic upgrade head

# Run seed data
echo "Seeding demo data..."
python -m app.utils.seed_demo

# Start uvicorn
echo "Starting uvicorn on port ${PORT:-8000}..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
