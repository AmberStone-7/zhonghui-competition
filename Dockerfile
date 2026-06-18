FROM python:3.12-slim

# Install Node.js for frontend build
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build frontend
COPY frontend/package.json frontend/package-lock.json ./frontend/
WORKDIR /app/frontend
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build && ls -la dist/

# Setup backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Copy frontend build to static directory
RUN mkdir -p /app/static && cp -r /app/frontend/dist/* /app/static/ && ls -la /app/static/

CMD ["bash", "startup.sh"]
