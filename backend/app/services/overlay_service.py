from pathlib import Path


class OverlayService:
    """Create a simple image-mask overlay for segmentation results."""

    def create_overlay(self, image_path: Path, mask_path: Path, output_path: Path) -> Path:
        try:
            from PIL import Image
        except ImportError as exc:
            raise RuntimeError("Pillow is required to generate overlays") from exc

        image = Image.open(image_path).convert("RGBA")
        mask = Image.open(mask_path).convert("L").resize(image.size)

        color = Image.new("RGBA", image.size, (255, 79, 123, 120))
        overlay = Image.composite(color, Image.new("RGBA", image.size, (0, 0, 0, 0)), mask)
        result = Image.alpha_composite(image, overlay)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        result.save(output_path)
        return output_path
