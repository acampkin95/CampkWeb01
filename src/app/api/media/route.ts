import { NextResponse } from "next/server";
import { deleteMedia, listMedia, saveMedia } from "@/lib/media";
import { FILE_UPLOAD, HTTP_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const assets = await listMedia();
  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ message: "Missing file" }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Validate file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      return NextResponse.json(
        { message: `File too large (max ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB)` },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate file type - HEIC/HEIF will be automatically converted to WebP
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as typeof FILE_UPLOAD.ALLOWED_TYPES[number])) {
      return NextResponse.json(
        { message: "Invalid file type. Only images (JPEG, PNG, WebP, GIF, HEIC/HEIF) are allowed" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const filename = (formData.get("name") as string) || (file as File).name || "upload";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const asset = await saveMedia(filename, buffer);
    return NextResponse.json(asset, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    logger.error("Media upload failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ message: "Upload failed" }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    if (!filename) {
      return NextResponse.json({ message: "filename query required" }, { status: HTTP_STATUS.BAD_REQUEST });
    }
    await deleteMedia(filename);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Media delete failed", {
      filename: new URL(request.url).searchParams.get("filename") ?? "unknown",
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json({ message: "Delete failed" }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
