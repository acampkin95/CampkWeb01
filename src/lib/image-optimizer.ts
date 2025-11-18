import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}

export interface OptimizedImage {
  filename: string;
  path: string;
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

export interface ImageVariants {
  original: OptimizedImage;
  thumbnail: OptimizedImage;
  medium: OptimizedImage;
  large: OptimizedImage;
  blurDataUrl: string;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const OPTIMIZED_DIR = path.join(UPLOAD_DIR, "optimized");

// Responsive breakpoints
const BREAKPOINTS = {
  thumbnail: 400,
  medium: 800,
  large: 1920,
};

/**
 * Ensure upload directories exist
 */
async function ensureDirectories() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(OPTIMIZED_DIR, { recursive: true });
}

/**
 * Generate unique filename
 */
function generateFilename(originalName: string, suffix?: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const hash = crypto.randomBytes(8).toString("hex");
  const safeName = name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const suffixStr = suffix ? `-${suffix}` : "";
  return `${safeName}-${hash}${suffixStr}`;
}

/**
 * Optimize single image variant
 */
async function optimizeVariant(
  buffer: Buffer,
  filename: string,
  options: OptimizeImageOptions
): Promise<OptimizedImage> {
  const {
    width,
    height,
    quality = 80,
    format = "webp",
    fit = "inside",
  } = options;

  await ensureDirectories();

  const outputFilename = `${filename}.${format}`;
  const outputPath = path.join(OPTIMIZED_DIR, outputFilename);
  const outputUrl = `/uploads/optimized/${outputFilename}`;

  // Process image with Sharp
  const pipeline = sharp(buffer);

  // Resize if dimensions provided
  if (width || height) {
    pipeline.resize(width, height, { fit, withoutEnlargement: true });
  }

  // Convert format and optimize
  switch (format) {
    case "webp":
      pipeline.webp({ quality, effort: 4 });
      break;
    case "avif":
      pipeline.avif({ quality, effort: 4 });
      break;
    case "jpeg":
      pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
      break;
    case "png":
      pipeline.png({ quality, compressionLevel: 9 });
      break;
  }

  // Save to disk
  const info = await pipeline.toFile(outputPath);

  // Get file size
  const stats = await fs.stat(outputPath);

  return {
    filename: outputFilename,
    path: outputPath,
    url: outputUrl,
    width: info.width,
    height: info.height,
    size: stats.size,
    format: info.format,
  };
}

/**
 * Generate blur placeholder (base64 data URL)
 */
async function generateBlurPlaceholder(buffer: Buffer): Promise<string> {
  const blurBuffer = await sharp(buffer)
    .resize(20, 20, { fit: "inside" })
    .webp({ quality: 20 })
    .blur(10)
    .toBuffer();

  return `data:image/webp;base64,${blurBuffer.toString("base64")}`;
}

/**
 * Optimize image with multiple responsive variants
 */
export async function optimizeImage(
  buffer: Buffer,
  originalName: string,
  category: "vehicle" | "warehouse" | "hero" | "general" = "general"
): Promise<ImageVariants> {
  const baseFilename = generateFilename(originalName);

  // Get image metadata
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width || 1920;

  // Category-specific settings
  const settings = {
    vehicle: { maxWidth: 1920, maxHeight: 1080 },
    warehouse: { maxWidth: 1920, maxHeight: 1080 },
    hero: { maxWidth: 2400, maxHeight: 1350 },
    general: { maxWidth: 1920, maxHeight: 1920 },
  }[category];

  // Generate variants in parallel
  const [original, thumbnail, medium, large, blurDataUrl] = await Promise.all([
    // Original (optimized)
    optimizeVariant(buffer, `${baseFilename}-original`, {
      width: Math.min(originalWidth, settings.maxWidth),
      height: settings.maxHeight,
      quality: 85,
      format: "webp",
      fit: "inside",
    }),

    // Thumbnail (400px)
    optimizeVariant(buffer, `${baseFilename}-thumb`, {
      width: BREAKPOINTS.thumbnail,
      quality: 80,
      format: "webp",
      fit: "cover",
    }),

    // Medium (800px)
    optimizeVariant(buffer, `${baseFilename}-md`, {
      width: BREAKPOINTS.medium,
      quality: 80,
      format: "webp",
      fit: "inside",
    }),

    // Large (1920px)
    optimizeVariant(buffer, `${baseFilename}-lg`, {
      width: BREAKPOINTS.large,
      quality: 82,
      format: "webp",
      fit: "inside",
    }),

    // Blur placeholder
    generateBlurPlaceholder(buffer),
  ]);

  return {
    original,
    thumbnail,
    medium,
    large,
    blurDataUrl,
  };
}

/**
 * Optimize single image (simple version)
 */
export async function optimizeSingleImage(
  buffer: Buffer,
  originalName: string,
  options: OptimizeImageOptions = {}
): Promise<OptimizedImage> {
  const filename = generateFilename(originalName);

  return optimizeVariant(buffer, filename, {
    quality: 80,
    format: "webp",
    ...options,
  });
}

/**
 * Delete optimized images
 */
export async function deleteOptimizedImages(baseFilename: string): Promise<void> {
  const suffixes = ["-original", "-thumb", "-md", "-lg"];

  await Promise.all(
    suffixes.map(async (suffix) => {
      const filename = `${baseFilename}${suffix}.webp`;
      const filepath = path.join(OPTIMIZED_DIR, filename);

      try {
        await fs.unlink(filepath);
      } catch (error) {
        // File might not exist, ignore error
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error(`Failed to delete ${filename}:`, error);
        }
      }
    })
  );
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

/**
 * Convert image to specific format
 */
export async function convertImage(
  buffer: Buffer,
  format: "webp" | "avif" | "jpeg" | "png",
  quality: number = 80
): Promise<Buffer> {
  const pipeline = sharp(buffer);

  switch (format) {
    case "webp":
      return pipeline.webp({ quality, effort: 4 }).toBuffer();
    case "avif":
      return pipeline.avif({ quality, effort: 4 }).toBuffer();
    case "jpeg":
      return pipeline.jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
    case "png":
      return pipeline.png({ quality, compressionLevel: 9 }).toBuffer();
  }
}

/**
 * Resize image to fit within dimensions
 */
export async function resizeImage(
  buffer: Buffer,
  width: number,
  height: number,
  fit: "cover" | "contain" | "fill" | "inside" | "outside" = "inside"
): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, height, { fit, withoutEnlargement: true })
    .toBuffer();
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  buffer: Buffer,
  size: number = 400
): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, { fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();
}

/**
 * Calculate image file size reduction percentage
 */
export function calculateSizeReduction(
  originalSize: number,
  optimizedSize: number
): number {
  return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
}

/**
 * Validate image file
 */
export async function validateImage(
  buffer: Buffer,
  options: {
    maxSizeMB?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowedFormats?: string[];
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxSizeMB = 10,
    maxWidth = 5000,
    maxHeight = 5000,
    allowedFormats = ["jpeg", "jpg", "png", "webp", "gif"],
  } = options;

  try {
    // Check file size
    const sizeMB = buffer.length / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB (received: ${sizeMB.toFixed(2)}MB)`,
      };
    }

    // Get metadata
    const metadata = await sharp(buffer).metadata();

    // Check format
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Invalid format. Allowed: ${allowedFormats.join(", ")}`,
      };
    }

    // Check dimensions
    if (metadata.width && metadata.width > maxWidth) {
      return {
        valid: false,
        error: `Image too wide. Maximum width: ${maxWidth}px`,
      };
    }

    if (metadata.height && metadata.height > maxHeight) {
      return {
        valid: false,
        error: `Image too tall. Maximum height: ${maxHeight}px`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "Invalid image file",
    };
  }
}
