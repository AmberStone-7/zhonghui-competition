from typing import Literal

from pydantic import BaseModel


class ConfigUpdateRequest(BaseModel):
    value: dict


class ChannelUpdateRequest(BaseModel):
    status: Literal["open", "closed"]
    start_time: str | None = None
    end_time: str | None = None
