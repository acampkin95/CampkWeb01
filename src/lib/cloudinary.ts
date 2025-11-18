import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadOptions {
  folder?: string;
  transformation?: any;
  publicId?: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary with automatic optimization
 * - Converts to WebP format
 * - Applies quality optimization
 * - Generates responsive breakpoints
 */
export async function uploadImage(
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const {
    folder = "campkin",
    transformation,
    publicId,
  } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        transformation: transformation || [
          { quality: "auto:good" },
          { fetch_format: "auto" }, // Auto WebP/AVIF
        ],
        responsive_breakpoints: {
          create_derived: true,
          bytes_step: 20000,
          min_width: 400,
          max_width: 1920,
          max_images: 5,
        },
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result as CloudinaryUploadResult);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload vehicle image with specific transformations
 */
export async function uploadVehicleImage(
  fileBuffer: Buffer,
  vehicleId: string,
  index: number
): Promise<CloudinaryUploadResult> {
  return uploadImage(fileBuffer, {
    folder: "campkin/vehicles",
    publicId: `${vehicleId}-${index}`,
    transformation: [
      { width: 1920, height: 1080, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });
}

/**
 * Upload warehouse unit image
 */
export async function uploadWarehouseImage(
  fileBuffer: Buffer,
  unitId: string,
  index: number
): Promise<CloudinaryUploadResult> {
  return uploadImage(fileBuffer, {
    folder: "campkin/warehouse",
    publicId: `${unitId}-${index}`,
    transformation: [
      { width: 1920, height: 1080, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });
}

/**
 * Upload hero/banner image
 */
export async function uploadHeroImage(
  fileBuffer: Buffer,
  name: string
): Promise<CloudinaryUploadResult> {
  return uploadImage(fileBuffer, {
    folder: "campkin/hero",
    publicId: name,
    transformation: [
      { width: 2400, height: 1350, crop: "limit" },
      { quality: "auto:best" },
      { fetch_format: "auto" },
    ],
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): string {
  const { width, height, crop = "limit", quality = "auto:good" } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { fetch_format: "auto" },
    ],
    secure: true,
  });
}

/**
 * Generate blur placeholder data URL for image
 */
export async function generateBlurPlaceholder(publicId: string): Promise<string> {
  return cloudinary.url(publicId, {
    transformation: [
      { width: 100, quality: "auto:low" },
      { fetch_format: "auto" },
      { effect: "blur:1000" },
    ],
    secure: true,
  });
}

export default cloudinary;
