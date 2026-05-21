export async function assetToFile(url: string, baseName: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load sample asset: ${url}`);
  }

  const blob = await response.blob();
  if (blob.type === "image/svg+xml" || url.endsWith(".svg")) {
    const dataUrl = await blobToDataUrl(blob);
    const pngBlob = await rasterizeToPng(dataUrl);
    return new File([pngBlob], `${baseName}.png`, { type: "image/png" });
  }

  const extension = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/png" ? "png" : "bin";
  return new File([blob], `${baseName}.${extension}`, {
    type: blob.type || "application/octet-stream"
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function rasterizeToPng(src: string) {
  return new Promise<Blob>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || 512;
      canvas.height = image.naturalHeight || 512;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas context is unavailable"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Failed to rasterize SVG asset"));
      }, "image/png");
    };
    image.onerror = () => reject(new Error("Failed to load SVG asset"));
    image.src = src;
  });
}
