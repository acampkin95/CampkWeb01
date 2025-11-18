import { NextResponse } from "next/server";
import { deleteMedia, listMedia, saveMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET() {
  const assets = await listMedia();
  return NextResponse.json({ assets });
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ message: "Missing file" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "File too large (max 10MB)" }, { status: 400 });
    }

    // Validate file type - HEIC/HEIF will be automatically converted to WebP
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type. Only images (JPEG, PNG, WebP, GIF, HEIC/HEIF) are allowed" }, { status: 400 });
    }

    const filename = (formData.get("name") as string) || (file as File).name || "upload";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const asset = await saveMedia(filename, buffer);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Media upload failed", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    if (!filename) {
      return NextResponse.json({ message: "filename query required" }, { status: 400 });
    }
    await deleteMedia(filename);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Media delete failed", error);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}
