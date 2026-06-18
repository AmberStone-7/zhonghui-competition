# backend/app/schemas/work.py
from pydantic import BaseModel, Field
from uuid import UUID


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=20)
    address: str = Field(..., min_length=1)
    tax_id: str = Field(..., min_length=1)
    phone: str = Field(..., pattern=r"^1\d{10}$")


class RegisterResponse(BaseModel):
    message: str


class WorkListItem(BaseModel):
    work_number: str | None
    name_masked: str
    images: list[str]
    vote_count: int

    class Config:
        from_attributes = True


class WorkListResponse(BaseModel):
    data: list[WorkListItem]
    total: int
    page: int
    size: int


class WorkDetail(BaseModel):
    id: UUID
    work_number: str | None
    contestant_name: str
    contestant_phone: str
    contestant_tax_id: str
    contestant_address: str
    images: list[str]
    status: str
    reject_reason: str | None
    created_at: str
    reviewed_at: str | None


class ApproveRequest(BaseModel):
    work_number: str | None = None


class RejectRequest(BaseModel):
    reason: str
