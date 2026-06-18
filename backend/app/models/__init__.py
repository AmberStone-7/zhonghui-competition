# backend/app/models/__init__.py
from app.models.user import AdminUser
from app.models.contestant import Contestant, Work
from app.models.vote import Vote
from app.models.score import Score
from app.models.audit_log import AuditLog
from app.models.site_config import SiteConfig

__all__ = ["AdminUser", "Contestant", "Work", "Vote", "Score", "AuditLog", "SiteConfig"]
