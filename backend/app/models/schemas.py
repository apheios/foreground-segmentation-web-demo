from typing import Any

from pydantic import BaseModel, Field


class ApiResponse(BaseModel):
    success: bool = True
    message: str | None = None
    data: Any | None = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Any | None = None


class HealthResponse(BaseModel):
    success: bool = Field(default=True)
    status: str = "ok"
    service: str


class SegmentationResult(BaseModel):
    original_url: str | None = None
    mask_url: str
    overlay_url: str
    metrics: dict[str, float | int] = Field(default_factory=dict)


class EvaluationExplanation(BaseModel):
    overview: str
    image_quality_observation: str
    task_observation: str
    supervision_observation: str


class EvaluationResult(BaseModel):
    iqa_score: float
    task_representativeness: int
    train_suitability: int
    explanation: EvaluationExplanation
    answer: dict[str, Any]


class EvaluationImageInput(BaseModel):
    data: bytes
    mime_type: str
    filename: str | None = None
