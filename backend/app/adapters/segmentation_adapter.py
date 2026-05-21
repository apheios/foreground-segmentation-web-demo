from __future__ import annotations

from contextlib import contextmanager
from functools import lru_cache
import sys
from pathlib import Path
from typing import Iterator


class SegmentationAdapterError(RuntimeError):
    pass


class MissingCheckpointError(SegmentationAdapterError):
    pass


@contextmanager
def _prepend_sys_paths(paths: list[Path]) -> Iterator[None]:
    inserted: list[str] = []
    for path in paths:
        path_str = str(path)
        if path.exists() and path_str not in sys.path:
            sys.path.insert(0, path_str)
            inserted.append(path_str)

    try:
        yield
    finally:
        for path_str in reversed(inserted):
            if path_str in sys.path:
                sys.path.remove(path_str)


class CamoDiffusionSingleImagePredictor:
    """Single-image inference wrapper around reference/CamoDiffusion."""

    def __init__(
        self,
        *,
        reference_dir: Path,
        config_path: Path,
        checkpoint_path: Path,
        device: str = "auto",
        num_sample_steps: int | None = None,
    ) -> None:
        if not reference_dir.exists():
            raise SegmentationAdapterError(f"CamoDiffusion reference directory not found: {reference_dir}")
        if not config_path.exists():
            raise SegmentationAdapterError(f"CamoDiffusion config not found: {config_path}")
        if not checkpoint_path.exists():
            raise MissingCheckpointError(f"CamoDiffusion checkpoint not found: {checkpoint_path}")

        self.reference_dir = reference_dir
        self.config_path = config_path
        self.checkpoint_path = checkpoint_path
        self.device_name = device
        self.num_sample_steps = num_sample_steps
        self._load_model()

    def predict(self, image_path: Path, output_path: Path) -> Path:
        if not image_path.exists():
            raise SegmentationAdapterError(f"Input image not found: {image_path}")

        with _prepend_sys_paths(self._module_paths()):
            import torch
            import torch.nn.functional as F
            from PIL import Image
            from torchvision import transforms

            image = Image.open(image_path).convert("RGB")
            original_size = image.size
            tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.inference_mode():
                output = self.train_val_forward_fn(self.model, image=tensor, verbose=False)
                pred = output["pred"].detach().cpu()
                pred = F.interpolate(
                    pred,
                    size=(original_size[1], original_size[0]),
                    mode="bilinear",
                    align_corners=False,
                )
                pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
                mask = (pred.squeeze().numpy() * 255).clip(0, 255).astype("uint8")

            output_path.parent.mkdir(parents=True, exist_ok=True)
            Image.fromarray(mask, mode="L").save(output_path)
            return output_path

    def _load_model(self) -> None:
        with _prepend_sys_paths(self._module_paths()):
            import torch
            from omegaconf import OmegaConf
            from torchvision import transforms
            from utils.import_utils import get_obj_from_str, instantiate_from_config, recurse_instantiate_from_config

            cfg = self._load_config()
            if self.num_sample_steps is not None:
                cfg.diffusion_model.params.num_sample_steps = self.num_sample_steps

            cond_uvit = instantiate_from_config(
                cfg.cond_uvit,
                conditioning_klass=get_obj_from_str(cfg.cond_uvit.params.conditioning_klass),
            )
            model = recurse_instantiate_from_config(cfg.model, unet=cond_uvit)
            diffusion_model = instantiate_from_config(cfg.diffusion_model, model=model)

            device = self._resolve_device(torch)
            checkpoint = torch.load(self.checkpoint_path, map_location=device)
            state_dict = checkpoint.get("model", checkpoint) if isinstance(checkpoint, dict) else checkpoint
            diffusion_model.load_state_dict(state_dict, strict=False)
            diffusion_model.to(device)
            diffusion_model.eval()

            image_size = int(cfg.diffusion_model.params.image_size)
            mean = [0.485, 0.456, 0.406]
            std = [0.229, 0.224, 0.225]
            self.transform = transforms.Compose(
                [
                    transforms.Resize((image_size, image_size)),
                    transforms.ToTensor(),
                    transforms.Normalize(mean, std),
                ]
            )
            self.model = diffusion_model
            self.device = device
            self.train_val_forward_fn = get_obj_from_str(cfg.train_val_forward_fn)

            # Keep OmegaConf imported inside the optional dependency boundary.
            self._OmegaConf = OmegaConf

    def _load_config(self):
        with _prepend_sys_paths(self._module_paths()):
            from omegaconf import OmegaConf

            def load_recursive(path: Path):
                cfg = OmegaConf.load(path)
                bases = list(cfg.get("__base__", []))
                cfg.__base__ = []
                merged = OmegaConf.create()
                for base in bases:
                    base_path = (self.reference_dir / base).resolve()
                    merged = OmegaConf.merge(merged, load_recursive(base_path))
                return OmegaConf.merge(merged, cfg)

            return load_recursive(self.config_path)

    def _module_paths(self) -> list[Path]:
        return [
            self.reference_dir,
            self.reference_dir / "denoising-diffusion-pytorch",
        ]

    def _resolve_device(self, torch):
        if self.device_name == "auto":
            return torch.device("cuda" if torch.cuda.is_available() else "cpu")
        return torch.device(self.device_name)


@lru_cache(maxsize=2)
def get_camodiffusion_predictor(
    reference_dir: str,
    config_path: str,
    checkpoint_path: str,
    device: str,
    num_sample_steps: int | None,
) -> CamoDiffusionSingleImagePredictor:
    return CamoDiffusionSingleImagePredictor(
        reference_dir=Path(reference_dir),
        config_path=Path(config_path),
        checkpoint_path=Path(checkpoint_path),
        device=device,
        num_sample_steps=num_sample_steps,
    )
