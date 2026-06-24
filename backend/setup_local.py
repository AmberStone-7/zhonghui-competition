#!/usr/bin/env python3
"""Local development setup: create database tables and seed data."""
import asyncio
import sys
import os

# Ensure we run from the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.utils.seed import seed

# Import all models so they're registered with Base
import app.models.user       # noqa
import app.models.contestant # noqa
import app.models.vote       # noqa
import app.models.score      # noqa
import app.models.audit_log  # noqa
import app.models.site_config # noqa


async def setup():
    print("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")

    print("Seeding initial data...")
    await seed()
    print("Setup complete!")


if __name__ == "__main__":
    asyncio.run(setup())
