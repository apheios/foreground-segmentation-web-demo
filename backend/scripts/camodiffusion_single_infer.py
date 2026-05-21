from __future__ import annotations

import argparse
from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.adapters.segmentation_adapter import get_camodiffusion_predictor


def infer_single_image(
    *,
    image_path: Path,
    output_path: Path,
    checkpoint_path: Path,
    config_path: Path | None = None,
    reference_dir: Path | None = None,
    device: str = "auto",
    num_sample_steps: int | None = None,
) -> Path:
    reference_dir = reference_dir or PROJECT_ROOT / "reference" / "CamoDiffusion"
    config_path = config_path or reference_dir / "config" / "camoDiffusion_384x384.yaml"

    predictor = get_camodiffusion_predictor(
        str(reference_dir),
        str(config_path),
        str(checkpoint_path),
        device,
        num_sample_steps,
    )
    return predictor.predict(image_path=image_path, output_path=output_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run CamoDiffusion single-image inference.")
    parser.add_argument("--image", required=True, type=Path, help="Input RGB image path.")
    parser.add_argument("--output", required=True, type=Path, help="Output mask PNG path.")
    parser.add_argument("--checkpoint", required=True, type=Path, help="CamoDiffusion checkpoint path.")
    parser.add_argument(
        "--config",
        type=Path,
        default=None,
        help="CamoDiffusion config path. Defaults to reference/CamoDiffusion/config/camoDiffusion_384x384.yaml.",
    )
    parser.add_argument(
        "--reference-dir",
        type=Path,
        default=None,
        help="CamoDiffusion repository path. Defaults to ../reference/CamoDiffusion.",
    )
    parser.add_argument("--device", default="auto", help="auto, cpu, cuda, cuda:0, etc.")
    parser.add_argument("--num-sample-steps", type=int, default=None)
    args = parser.parse_args()

    result = infer_single_image(
        image_path=args.image,
        output_path=args.output,
        checkpoint_path=args.checkpoint,
        config_path=args.config,
        reference_dir=args.reference_dir,
        device=args.device,
        num_sample_steps=args.num_sample_steps,
    )
    print(result)


if __name__ == "__main__":
    main()
