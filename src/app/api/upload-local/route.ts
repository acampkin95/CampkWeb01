import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { optimizeImage, validateImage, deleteOptimizedImages } from "@/lib/image-optimizer";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Upload and optimize image locally (no Cloudinary required)
 * POST /api/upload-local
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const session = cookieStore.get("campkin_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as "vehicle" | "warehouse" | "hero" | "general") || "general";
    const altText = formData.get("altText") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate image
    const validation = await validateImage(buffer, {
      maxSizeMB: 10,
      maxWidth: 5000,
      maxHeight: 5000,
      allowedFormats: ["jpeg", "jpg", "png", "webp", "gif"],
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Optimize with multiple variants
    const variants = await optimizeImage(buffer, file.name, category);

    // Calculate size reduction
    const originalSize = buffer.length;
    const optimizedSize = variants.large.size;
    const reductionPercent = Math.round(
      ((originalSize - optimizedSize) / originalSize) * 100
    );

    console.log(
      `✓ Image optimized: ${file.name} (${(originalSize / 1024).toFixed(0)}KB → ${(optimizedSize / 1024).toFixed(0)}KB, -${reductionPercent}%)`
    );

    return NextResponse.json({
      success: true,
      message: `Image optimized successfully (${reductionPercent}% size reduction)`,
      data: {
        original: {
          url: variants.original.url,
          width: variants.original.width,
          height: variants.original.height,
          size: variants.original.size,
        },
        variants: {
          thumbnail: variants.thumbnail.url,
          medium: variants.medium.url,
          large: variants.large.url,
        },
        blurDataUrl: variants.blurDataUrl,
        metadata: {
          filename: variants.original.filename,
          format: variants.original.format,
          originalSize,
          optimizedSize,
          reductionPercent,
          altText: altText || file.name,
          category,
        },
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload and optimize image",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Delete optimized images
 * DELETE /api/upload-local?filename=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const session = cookieStore.get("campkin_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Filename required" }, { status: 400 });
    }

    // Extract base filename (remove suffix and extension)
    const baseFilename = filename
      .replace(/-original|-thumb|-md|-lg/, "")
      .replace(/\.(webp|avif|jpeg|png)$/, "");

    await deleteOptimizedImages(baseFilename);

    return NextResponse.json({
      success: true,
      message: "Images deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete images" },
      { status: 500 }
    );
  }
}

/**
 * List uploaded images
 * GET /api/upload-local
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const session = cookieStore.get("campkin_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const optimizedDir = path.join(process.cwd(), "public", "uploads", "optimized");

    try {
      const files = await fs.readdir(optimizedDir);

      // Group by base filename
      const imageGroups: Record<
        string,
        { original?: string; thumbnail?: string; medium?: string; large?: string }
      > = {};

      for (const file of files) {
        const match = file.match(/^(.+?)-(original|thumb|md|lg)\.webp$/);
        if (match) {
          const [, baseFilename, variant] = match;
          if (!imageGroups[baseFilename]) {
            imageGroups[baseFilename] = {};
          }

          const variantKey =
            variant === "thumb"
              ? "thumbnail"
              : variant === "md"
                ? "medium"
                : variant === "lg"
                  ? "large"
                  : "original";

          imageGroups[baseFilename][variantKey] = `/uploads/optimized/${file}`;
        }
      }

      const images = Object.entries(imageGroups).map(([baseFilename, variants]) => ({
        baseFilename,
        ...variants,
      }));

      return NextResponse.json({
        success: true,
        count: images.length,
        images,
      });
    } catch (error) {
      // Directory might not exist yet
      return NextResponse.json({
        success: true,
        count: 0,
        images: [],
      });
    }
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json(
      { error: "Failed to list images" },
      { status: 500 }
    );
  }
}
