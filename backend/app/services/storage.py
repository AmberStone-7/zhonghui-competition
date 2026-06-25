import asyncio
import logging

from supabase import create_client, SupabaseException
from app.config import settings

logger = logging.getLogger("uvicorn.error")
_supabase = None


def _get_supabase():
    global _supabase
    if _supabase is None:
        try:
            _supabase = create_client(settings.supabase_url, settings.supabase_key)
            logger.info("Supabase client initialized successfully")
        except SupabaseException:
            logger.warning(
                "Supabase client initialization failed: invalid API key. "
                "Image uploads will be unavailable."
            )
            _supabase = False
    return _supabase if _supabase is not False else None


async def upload_image(file_content: bytes, filename: str, content_type: str = "image/jpeg") -> str:
    """上传图片到 Supabase Storage，返回公开 URL"""
    client = _get_supabase()
    if client is None:
        raise RuntimeError("Supabase storage is not available: invalid API credentials")

    def _upload():
        client.storage.from_(settings.supabase_storage_bucket).upload(
            path=filename,
            file=file_content,
            file_options={"content-type": content_type, "upsert": "false"},
        )
        return client.storage.from_(settings.supabase_storage_bucket).get_public_url(filename)

    return await asyncio.to_thread(_upload)


async def delete_image(filename: str) -> None:
    """从 Supabase Storage 删除图片"""
    client = _get_supabase()
    if client is None:
        raise RuntimeError("Supabase storage is not available: invalid API credentials")
    await asyncio.to_thread(
        lambda: client.storage.from_(settings.supabase_storage_bucket).remove([filename])
    )
