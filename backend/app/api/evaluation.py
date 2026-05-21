from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse

from app.core.paths import UPLOADS_DIR
from app.models.schemas import EvaluationImageInput
from app.services.evaluation_service import EvaluationService, EvaluationServiceError

router = APIRouter(prefix="/evaluation", tags=["evaluation"])
SUPPORTED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def _save_upload(file: UploadFile, prefix: str) -> tuple[str, EvaluationImageInput]:
    suffix = Path(file.filename or "").suffix.lower()
    content_type = file.content_type or ""
    if content_type not in SUPPORTED_IMAGE_TYPES:
        content_type = "image/png"
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        suffix = SUPPORTED_IMAGE_TYPES[content_type]

    output_path = UPLOADS_DIR / f"{prefix}-{uuid4().hex}{suffix}"
    data = bytearray()
    with output_path.open("wb") as output_file:
        while chunk := file.file.read(1024 * 1024):
            data.extend(chunk)
            output_file.write(chunk)

    return (
        f"/static/outputs/uploads/{output_path.name}",
        EvaluationImageInput(
            data=bytes(data),
            mime_type=content_type,
            filename=file.filename,
        ),
    )


@router.post("/evaluate")
def evaluate_sample(
    task_type: str = Form(...),
    sample_id: str | None = Form(default=None),
    image: UploadFile | None = File(default=None),
    mask: UploadFile | None = File(default=None),
) -> dict:
    image_url, image_input = _save_upload(image, "image") if image else (None, None)
    mask_url, mask_input = _save_upload(mask, "mask") if mask else (None, None)

    try:
        outcome = EvaluationService().evaluate(
            task_type=task_type,
            image=image_input,
            mask=mask_input,
        )
    except EvaluationServiceError as exc:
        return JSONResponse(
            status_code=502,
            content={
                "success": False,
                "message": str(exc),
                "data": None,
            },
        )

    return {
        "success": True,
        "message": f"{outcome.provider} evaluation completed",
        "data": {
            **outcome.result.model_dump(),
            "sample_id": sample_id,
            "task_type": task_type,
            "image_url": image_url,
            "mask_url": mask_url,
            "provider": outcome.provider,
            "model": outcome.model,
        },
    }
