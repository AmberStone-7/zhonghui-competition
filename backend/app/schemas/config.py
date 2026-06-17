from pydantic import BaseModel


class ConfigUpdateRequest(BaseModel):
    value: dict


class ChannelUpdateRequest(BaseModel):
    status: str  # "open" or "closed"
    start_time: str | None = None
    end_time: str | None = None
