from uuid import UUID

from pydantic import BaseModel, Field


class VoteRequest(BaseModel):
    work_id: UUID
    phone: str = Field(..., pattern=r"^1\d{10}$")


class VoteResponse(BaseModel):
    message: str
    new_vote_count: int


class VoteStatusResponse(BaseModel):
    channel_status: str
    custom_message: str
