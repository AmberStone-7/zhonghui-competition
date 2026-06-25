#!/bin/bash
# Run seed data for demo
python -m app.utils.seed_demo
# Start server
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
Thu Jun 25 19:18:32 CST 2026
