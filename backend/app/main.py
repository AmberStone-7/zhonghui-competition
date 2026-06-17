# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.admin.auth import router as admin_auth_router
from app.api.admin.works import router as admin_works_router
from app.api.admin.config import router as admin_config_router
from app.api.admin.channels import router as admin_channels_router
from app.api.public.register import router as public_register_router
from app.api.public.works import router as public_works_router
from app.api.public.config import router as public_config_router

app = FastAPI(title="中汇文具 20 周年橱窗大赛 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(admin_auth_router)
app.include_router(admin_works_router)
app.include_router(admin_config_router)
app.include_router(admin_channels_router)
app.include_router(public_register_router)
app.include_router(public_works_router)
app.include_router(public_config_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
