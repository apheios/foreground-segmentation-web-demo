from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, UploadFile

from app.core.paths import UPLOADS_DIR
from app.services.evaluation_service import EvaluationService

router = APIRouter(prefix="/evaluation", tags=["evaluation"])


def _save_upload(file: UploadFile, prefix: str) -> str:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png"}:
        suffix = ".png"

    output_path = UPLOADS_DIR / f"{prefix}-{uuid4().hex}{suffix}"
    with output_path.open("wb") as output_file:
        while chunk := file.file.read(1024 * 1024):
            output_file.write(chunk)

    return f"/static/outputs/uploads/{output_path.name}"


@router.post("/evaluate")
def evaluate_sample(
    task_type: str = Form(...),
    sample_id: str | None = Form(default=None),
    image: UploadFile | None = File(default=None),
    mask: UploadFile | None = File(default=None),
) -> dict:
    image_url = _save_upload(image, "image") if image else None
    mask_url = _save_upload(mask, "mask") if mask else None
    result = EvaluationService().evaluate(task_type=task_type, has_mask=bool(mask or sample_id))
    return {
        "success": True,
        "message": "mock evaluation completed",
        "data": {
            **result.model_dump(),
            "sample_id": sample_id,
            "task_type": task_type,
            "image_url": image_url,
            "mask_url": mask_url,
        },
    }
