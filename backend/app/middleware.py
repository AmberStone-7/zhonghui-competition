import time
import asyncio
from collections import defaultdict
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger("uvicorn.access")


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter using IP + path as key."""

    def __init__(self, app, requests_per_minute: int = 30):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_start: dict[str, float] = defaultdict(time.time)
        self.counters: dict[str, int] = defaultdict(int)

    async def dispatch(self, request: Request, call_next):
        # Only rate-limit POST /api/vote and POST /api/register
        if request.url.path in ("/api/vote", "/api/register") and request.method == "POST":
            client_ip = request.client.host if request.client else "unknown"
            key = f"{client_ip}:{request.url.path}"
            now = time.time()

            if now - self.window_start[key] > 60:
                self.window_start[key] = now
                self.counters[key] = 0

            self.counters[key] += 1
            if self.counters[key] > self.requests_per_minute:
                from fastapi.responses import JSONResponse
                return JSONResponse(
                    status_code=429,
                    content={"detail": "请求过于频繁，请稍后再试"},
                )

        return await call_next(request)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        duration_ms = (time.time() - start) * 1000
        logger.info(
            f"{request.method} {request.url.path} → {response.status_code} ({duration_ms:.0f}ms)"
        )
        return response
