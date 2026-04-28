import type { PreviewContent } from "../../types";

type Props = {
  preview: PreviewContent;
  variant: "gallery" | "modal";
};

export function MediaPreview({ preview, variant }: Props) {
  if (preview.kind === "layered") {
    return (
      <div className={`layered-preview ${variant === "modal" ? "is-modal" : ""}`}>
        <img src={preview.baseSrc} alt={preview.title} className="layered-base" />
        <img src={preview.maskSrc} alt={preview.title} className="layered-mask" />
      </div>
    );
  }

  return (
    <img
      src={preview.src}
      alt={preview.title}
      className={variant === "modal" ? "modal-image" : "gallery-image"}
    />
  );
}
