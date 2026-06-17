#!/bin/bash
echo "Running database migrations..."
cd /app && alembic upgrade head

echo "Seeding initial data..."
python -m app.utils.seed

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
