from pydantic import BaseModel


class ScoreItemSubmission(BaseModel):
    item_name: str
    selected_score: float


class ScoreSubmission(BaseModel):
    items: list[ScoreItemSubmission]


class ScoringTaskItem(BaseModel):
    name: str
    options: list[dict]


class ScoringTaskResponse(BaseModel):
    work_id: str
    work_number: str
    contestant_name: str
    images: list[str]
    board_name: str
    max_score: float
    items: list[ScoringTaskItem]
    current_score: dict | None
