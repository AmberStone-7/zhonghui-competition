# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
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
app.add_middleware(RateLimitMiddleware, requests_per_minute=30)

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
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

if os.path.isdir(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

    @app.get("/{full_path:path}", response_class=HTMLResponse)
    async def serve_spa(full_path: str):
        index_path = os.path.join(STATIC_DIR, "index.html")
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
