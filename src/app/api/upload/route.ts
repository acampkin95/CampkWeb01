import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { uploadImage, uploadVehicleImage, uploadWarehouseImage, uploadHeroImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { MediaCategory } from "@prisma/client";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Upload image to Cloudinary with automatic optimization
 * POST /api/upload
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
    const category = (formData.get("category") as MediaCategory) || "OTHER";
    const entityId = formData.get("entityId") as string | null;
    const altText = formData.get("altText") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload based on category
    let result;
    let index = 0;

    switch (category) {
      case "VEHICLE":
        if (!entityId) {
          return NextResponse.json({ error: "Vehicle ID required" }, { status: 400 });
        }
        result = await uploadVehicleImage(buffer, entityId, index);
        break;

      case "WAREHOUSE":
        if (!entityId) {
          return NextResponse.json({ error: "Warehouse unit ID required" }, { status: 400 });
        }
        result = await uploadWarehouseImage(buffer, entityId, index);
        break;

      case "HERO":
        result = await uploadHeroImage(buffer, `hero-${Date.now()}`);
        break;

      default:
        result = await uploadImage(buffer, { folder: "campkin/general" });
    }

    // Save to database
    const media = await prisma.media.create({
      data: {
        filename: result.public_id,
        originalName: file.name,
        mimeType: file.type,
        size: result.bytes,
        url: result.url,
        cdnUrl: result.secure_url,
        cloudinaryId: result.public_id,
        width: result.width,
        height: result.height,
        altText: altText || file.name,
        category,
        uploadedBy: "admin", // TODO: Get from session
      },
    });

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        url: media.cdnUrl,
        cloudinaryId: media.cloudinaryId,
        width: media.width,
        height: media.height,
      },
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

/**
 * Delete image from Cloudinary and database
 * DELETE /api/upload?id=xxx
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
    const mediaId = searchParams.get("id");

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    // Get media from database
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    if (media.cloudinaryId) {
      const cloudinary = await import("cloudinary");
      await cloudinary.v2.uploader.destroy(media.cloudinaryId);
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
