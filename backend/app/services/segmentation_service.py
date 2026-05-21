from pathlib import Path
from time import perf_counter
from uuid import uuid4

from app.adapters.segmentation_adapter import MissingCheckpointError, SegmentationAdapterError, get_camodiffusion_predictor
from app.core.config import get_settings
from app.core.paths import BACKEND_DIR, CAMODIFFUSION_DIR, OUTPUTS_DIR
from app.models.schemas import SegmentationResult
from app.services.overlay_service import OverlayService


class SegmentationService:
    """Segmentation workflow with optional CamoDiffusion backend."""

    def infer(
        self,
        task_type: str,
        original_url: str | None = None,
        image_path: Path | None = None,
    ) -> SegmentationResult:
        settings = get_settings()
        checkpoint_path = self._checkpoint_path(settings.camodiffusion_checkpoint_path)

        if image_path and checkpoint_path:
            try:
                return self._infer_with_camodiffusion(
                    image_path=image_path,
                    original_url=original_url,
                    checkpoint_path=checkpoint_path,
                    config_path=self._config_path(settings.camodiffusion_config_path),
                    reference_dir=self._reference_dir(settings.camodiffusion_reference_dir),
                    device=settings.camodiffusion_device,
                    num_sample_steps=settings.camodiffusion_num_sample_steps,
                )
            except MissingCheckpointError:
                pass
            except SegmentationAdapterError as exc:
                return self._mock_infer(
                    task_type=task_type,
                    original_url=original_url,
                    fallback_reason=str(exc),
                )
            except RuntimeError as exc:
                return self._mock_infer(
                    task_type=task_type,
                    original_url=original_url,
                    fallback_reason=str(exc),
                )

        return self._mock_infer(task_type=task_type, original_url=original_url)

    def _infer_with_camodiffusion(
        self,
        *,
        image_path: Path,
        original_url: str | None,
        checkpoint_path: Path,
        config_path: Path,
        reference_dir: Path,
        device: str,
        num_sample_steps: int | None,
    ) -> SegmentationResult:
        started = perf_counter()
        output_stem = uuid4().hex
        mask_path = OUTPUTS_DIR / f"camodiffusion-mask-{output_stem}.png"
        overlay_path = OUTPUTS_DIR / f"camodiffusion-overlay-{output_stem}.png"

        predictor = get_camodiffusion_predictor(
            str(reference_dir),
            str(config_path),
            str(checkpoint_path),
            device,
            num_sample_steps,
        )
        predictor.predict(image_path=image_path, output_path=mask_path)
        OverlayService().create_overlay(image_path=image_path, mask_path=mask_path, output_path=overlay_path)

        elapsed_ms = int((perf_counter() - started) * 1000)
        return SegmentationResult(
            original_url=original_url,
            mask_url=f"/static/outputs/{mask_path.name}",
            overlay_url=f"/static/outputs/{overlay_path.name}",
            metrics={
                "inference_time_ms": elapsed_ms,
                "provider": 1,
                "checkpoint_loaded": 1,
            },
        )

    def _mock_infer(
        self,
        *,
        task_type: str,
        original_url: str | None = None,
        fallback_reason: str | None = None,
    ) -> SegmentationResult:
        metrics: dict[str, float | int] = {
            "inference_time_ms": 86,
            "foreground_ratio": 0.37,
            "confidence": 0.91,
            "task_bias": self._task_bias(task_type),
            "provider": 0,
        }
        if fallback_reason:
            metrics["fallback"] = 1

        return SegmentationResult(
            original_url=original_url,
            mask_url="/static/outputs/mock-mask.svg",
            overlay_url="/static/outputs/mock-overlay.svg",
            metrics=metrics,
        )

    def _reference_dir(self, configured_path: str | None) -> Path:
        return self._resolve_configured_path(configured_path) if configured_path else CAMODIFFUSION_DIR

    def _config_path(self, configured_path: str | None) -> Path:
        if configured_path:
            return self._resolve_configured_path(configured_path)
        return CAMODIFFUSION_DIR / "config" / "camoDiffusion_384x384.yaml"

    def _checkpoint_path(self, configured_path: str | None) -> Path | None:
        if not configured_path:
            return None
        path = self._resolve_configured_path(configured_path)
        return path if path.exists() else None

    def _resolve_configured_path(self, configured_path: str) -> Path:
        path = Path(configured_path).expanduser()
        if not path.is_absolute():
            path = BACKEND_DIR / path
        return path.resolve()

    def _task_bias(self, task_type: str) -> int:
        return {
            "SOD": 1,
            "COD": 2,
            "ORSI-SOD": 3,
            "DBD": 4,
        }.get(task_type, 0)
