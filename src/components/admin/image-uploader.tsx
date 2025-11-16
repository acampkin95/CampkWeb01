"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface ImageVariant {
  url: string;
  width: number;
  height: number;
  size: number;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    original: ImageVariant;
    variants: {
      thumbnail: string;
      medium: string;
      large: string;
    };
    blurDataUrl: string;
    metadata: {
      filename: string;
      format: string;
      originalSize: number;
      optimizedSize: number;
      reductionPercent: number;
      altText: string;
      category: string;
    };
  };
}

interface ImageUploaderProps {
  category?: "vehicle" | "warehouse" | "hero" | "general";
  onUploadSuccess?: (data: UploadResponse["data"]) => void;
  onUploadError?: (error: string) => void;
}

export function ImageUploader({
  category = "general",
  onUploadSuccess,
  onUploadError,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size: 10MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setError(null);
    setUploadedImage(null);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError("Please select a file first");
      return;
    }

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("altText", file.name);

    setUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/upload-local", {
        method: "POST",
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadedImage(result.data || null);
      onUploadSuccess?.(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setUploadedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Upload Image</h3>
        <p className="text-sm text-slate-600">
          Automatically optimized to WebP with responsive variants
        </p>
      </div>

      {error && (
        <Alert variant="error">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      {!uploadedImage && (
        <>
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-slate-200"
            />

            {preview && (
              <div className="relative overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              isLoading={uploading}
              disabled={!preview || uploading}
            >
              {uploading ? "Optimizing..." : "Upload & Optimize"}
            </Button>

            {preview && (
              <Button onClick={handleReset} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </>
      )}

      {uploadedImage && (
        <div className="space-y-4">
          <Alert variant="success">
            <p className="text-sm font-semibold">
              {uploadedImage.metadata.reductionPercent}% size reduction!
            </p>
            <p className="text-xs text-slate-600">
              {(uploadedImage.metadata.originalSize / 1024).toFixed(0)}KB →{" "}
              {(uploadedImage.metadata.optimizedSize / 1024).toFixed(0)}KB
            </p>
          </Alert>

          {/* Image variants preview */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Thumbnail (400px)
              </p>
              <img
                src={uploadedImage.variants.thumbnail}
                alt="Thumbnail"
                className="rounded-lg border border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Medium (800px)
              </p>
              <img
                src={uploadedImage.variants.medium}
                alt="Medium"
                className="rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Large (1920px)
            </p>
            <img
              src={uploadedImage.variants.large}
              alt="Large"
              className="rounded-lg border border-slate-200"
            />
          </div>

          {/* Blur placeholder demo */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Blur Placeholder (20px)
            </p>
            <div className="relative h-24 overflow-hidden rounded-lg border border-slate-200">
              <img
                src={uploadedImage.blurDataUrl}
                alt="Blur placeholder"
                className="h-full w-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>

          {/* URLs for copying */}
          <div className="space-y-2 rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Image URLs
            </p>
            <div className="space-y-1">
              <code className="block text-xs text-slate-700">
                Original: {uploadedImage.original.url}
              </code>
              <code className="block text-xs text-slate-700">
                Thumbnail: {uploadedImage.variants.thumbnail}
              </code>
              <code className="block text-xs text-slate-700">
                Medium: {uploadedImage.variants.medium}
              </code>
              <code className="block text-xs text-slate-700">
                Large: {uploadedImage.variants.large}
              </code>
            </div>
          </div>

          <Button onClick={handleReset} variant="outline" className="w-full">
            Upload Another Image
          </Button>
        </div>
      )}
    </div>
  );
}
