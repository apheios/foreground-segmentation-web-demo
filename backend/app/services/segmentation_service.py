from app.models.schemas import SegmentationResult


class SegmentationService:
    """Mock segmentation workflow; replace the adapter call when the real model is ready."""

    def infer(self, task_type: str, original_url: str | None = None) -> SegmentationResult:
        return SegmentationResult(
            original_url=original_url,
            mask_url="/static/outputs/mock-mask.svg",
            overlay_url="/static/outputs/mock-overlay.svg",
            metrics={
                "inference_time_ms": 86,
                "foreground_ratio": 0.37,
                "confidence": 0.91,
                "task_bias": self._task_bias(task_type),
            },
        )

    def _task_bias(self, task_type: str) -> int:
        return {
            "SOD": 1,
            "COD": 2,
            "ORSI-SOD": 3,
            "DBD": 4,
        }.get(task_type, 0)
