"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "./Button";

type Area = { x: number; y: number; width: number; height: number };

type Props = {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
};

async function getCroppedBlob(
  imageSrc: string,
  area: Area,
  outSize = 512,
): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize canvas");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    outSize,
    outSize,
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Crop failed"));
        resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}

export function AvatarCropModal({ imageSrc, onCancel, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: unknown, croppedPixels: Area) => {
    setArea(croppedPixels);
  }, []);

  async function handleConfirm() {
    if (!area) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(imageSrc, area, 512);
      await onConfirm(blob);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-background w-full max-w-xl rounded-lg p-4 space-y-4">
        <div className="relative h-80 w-full">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-end gap-2">
            <Button variant={"outline"} onClick={onCancel} disabled={busy}>
                Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={busy}>
                {busy ? "Applying..." : "Apply Crop"}
            </Button>
        </div>
      </div>
    </div>
  );
}
