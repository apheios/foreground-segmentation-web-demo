import type { PreviewContent } from "../../types";
import { MediaPreview } from "./MediaPreview";

type Props = {
  title: string;
  preview: PreviewContent;
  onOpen: () => void;
};

export function GalleryCard({ title, preview, onOpen }: Props) {
  return (
    <button className="gallery-card" type="button" onClick={onOpen}>
      <div className="gallery-image-frame">
        <MediaPreview preview={preview} variant="gallery" />
      </div>
      <div className="gallery-caption">{title}</div>
    </button>
  );
}
