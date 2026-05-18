import type { PreviewContent } from "../../types";
import { MediaPreview } from "./MediaPreview";

type Props = {
  preview: PreviewContent | null;
  onClose: () => void;
};

export function ImagePreviewModal({ preview, onClose }: Props) {
  if (!preview) {
    return null;
  }

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal-dialog" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}>
          关闭
        </button>
        <div className="modal-media-frame">
          <MediaPreview preview={preview} variant="modal" />
        </div>
        <div className="modal-caption">{preview.title}</div>
      </div>
    </div>
  );
}
