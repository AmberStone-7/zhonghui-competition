# backend/app/main.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.middleware import RateLimitMiddleware, RequestLoggingMiddleware
from app.api.admin.auth import router as admin_auth_router
from app.api.admin.works import router as admin_works_router
from app.api.admin.config import router as admin_config_router
from app.api.admin.channels import router as admin_channels_router
from app.api.public.register import router as public_register_router
from app.api.public.works import router as public_works_router
from app.api.public.config import router as public_config_router
from app.api.public.vote import router as public_vote_router
from app.api.admin.scoring import router as admin_scoring_router
from app.api.admin.scores import router as admin_scores_router
from app.api.admin.users import router as admin_users_router
from app.api.admin.export import router as admin_export_router

logger = logging.getLogger("uvicorn.error")
app = FastAPI(title="中汇文具 20 周年橱窗大赛 API", version="1.0.0")

origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
if settings.frontend_url and settings.frontend_url not in origins:
    origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

app.include_router(admin_auth_router)
app.include_router(admin_works_router)
app.include_router(admin_config_router)
app.include_router(admin_channels_router)
app.include_router(public_register_router)
app.include_router(public_works_router)
app.include_router(public_config_router)
app.include_router(public_vote_router)
app.include_router(admin_scoring_router)
app.include_router(admin_scores_router)
app.include_router(admin_users_router)
app.include_router(admin_export_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


# --- Serve Frontend Static Files ---
# Try multiple possible static directories
_candidates = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "static"),  # /app/static/
    os.path.join(os.path.dirname(__file__), "static"),                   # /app/app/static/
    "/app/static",
    os.path.join(os.getcwd(), "static"),
]

STATIC_DIR = None
for d in _candidates:
    if os.path.isdir(d):
        STATIC_DIR = d
        break

if STATIC_DIR:
    logger.info(f"Serving static files from: {STATIC_DIR}")
    # Mount static files at root so /assets/... resolves correctly
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

    logger.warning(f"No static directory found. Checked: {_candidates}")
    logger.warning(f"cwd={os.getcwd()}, __file__={__file__}")
    for d in _candidates:
        logger.warning(f"  {d}: exists={os.path.exists(d)}, isdir={os.path.isdir(d) if os.path.exists(d) else 'N/A'}")
