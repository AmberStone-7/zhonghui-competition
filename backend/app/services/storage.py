import asyncio

from supabase import create_client
from app.config import settings

supabase = create_client(settings.supabase_url, settings.supabase_key)


async def upload_image(file_content: bytes, filename: str, content_type: str = "image/jpeg") -> str:
    """上传图片到 Supabase Storage，返回公开 URL"""

    def _upload():
        supabase.storage.from_(settings.supabase_storage_bucket).upload(
            path=filename,
            file=file_content,
            file_options={"content-type": content_type, "upsert": "false"},
        )
        return supabase.storage.from_(settings.supabase_storage_bucket).get_public_url(filename)

    return await asyncio.to_thread(_upload)


async def delete_image(filename: str) -> None:
    """从 Supabase Storage 删除图片"""
    await asyncio.to_thread(
        lambda: supabase.storage.from_(settings.supabase_storage_bucket).remove([filename])
    )
