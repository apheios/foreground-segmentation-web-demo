from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, UploadFile

from app.core.paths import UPLOADS_DIR
from app.services.segmentation_service import SegmentationService

router = APIRouter(prefix="/segmentation", tags=["segmentation"])


def _save_upload(file: UploadFile) -> tuple[str, Path]:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png"}:
        suffix = ".png"

    output_path = UPLOADS_DIR / f"{uuid4().hex}{suffix}"
    with output_path.open("wb") as output_file:
        while chunk := file.file.read(1024 * 1024):
            output_file.write(chunk)

    return f"/static/outputs/uploads/{output_path.name}", output_path


@router.post("/infer")
def infer_segmentation(
    task_type: str = Form(...),
    sample_id: str | None = Form(default=None),
    image: UploadFile | None = File(default=None),
) -> dict:
    original_url, image_path = _save_upload(image) if image else (None, None)
    result = SegmentationService().infer(
        task_type=task_type,
        original_url=original_url,
        image_path=image_path,
    )
    return {
        "success": True,
        "message": "segmentation completed",
        "data": {
            **result.model_dump(),
            "sample_id": sample_id,
            "task_type": task_type,
        },
    }
