import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger("uvicorn.access")

# Default rate limits (requests per minute)
DEFAULT_RULES: list[tuple[str, str, int]] = [
    # (method, path_prefix, limit_per_minute)
    ("POST", "/api/admin/login", 5),       # anti brute-force
    ("POST", "/api/admin/scoring/", 20),   # scoring submission
    ("POST", "/api/admin/scores/", 10),    # lock endpoint
    ("POST", "/api/vote", 30),             # public voting
    ("POST", "/api/register", 30),         # public registration
]

class RateLimitMiddleware(BaseHTTPMiddleware):
    """In-memory rate limiter with prefix-based path matching and per-endpoint limits."""

    def __init__(self, app, rules: list[tuple[str, str, int]] | None = None):
        super().__init__(app)
        self.rules = rules or DEFAULT_RULES
        self.window_start: dict[str, float] = defaultdict(time.time)
        self.counters: dict[str, int] = defaultdict(int)

    async def dispatch(self, request: Request, call_next):
        for method, path_prefix, limit in self.rules:
            if request.method != method:
                continue
            match = False
            if path_prefix.endswith("/"):
                match = request.url.path.startswith(path_prefix)
            else:
                match = request.url.path == path_prefix

            if not match:
                continue

            client_ip = request.client.host if request.client else "unknown"
            key = f"{client_ip}:{path_prefix}"
            now = time.time()

            if now - self.window_start[key] > 60:
                self.window_start[key] = now
                self.counters[key] = 0

            self.counters[key] += 1
            if self.counters[key] > limit:
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
