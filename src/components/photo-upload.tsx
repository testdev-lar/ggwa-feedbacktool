"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import Image from "next/image";

interface PhotoUploadProps {
  onPhotosReady: (files: File[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({
  onPhotosReady,
  maxPhotos = 10,
}: PhotoUploadProps) {
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxPhotos - previews.length;
    const toProcess = files.slice(0, remaining);

    setCompressing(true);
    try {
      const compressed = await Promise.all(
        toProcess.map((file) =>
          imageCompression(file, {
            maxWidthOrHeight: 1200,
            maxSizeMB: 1,
            useWebWorker: true,
          })
        )
      );

      const newPreviews = compressed.map((file) => ({
        url: URL.createObjectURL(file),
        file: new File([file], file.name, { type: file.type }),
      }));

      const updated = [...previews, ...newPreviews];
      setPreviews(updated);
      onPhotosReady(updated.map((p) => p.file));
    } finally {
      setCompressing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePhoto(index: number) {
    const updated = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index].url);
    setPreviews(updated);
    onPhotosReady(updated.map((p) => p.file));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Job Photos ({previews.length}/{maxPhotos})
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {previews.map((preview, i) => (
            <div key={i} className="relative group">
              <Image
                src={preview.url}
                alt={`Photo ${i + 1}`}
                width={200}
                height={150}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length < maxPhotos && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="flex items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            {compressing ? (
              <span className="text-gray-500">Compressing photos...</span>
            ) : (
              <span className="text-gray-500">
                Click to add photos (max {maxPhotos})
              </span>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
