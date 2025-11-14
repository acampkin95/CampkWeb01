import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { MediaAsset } from "@/types/media";

const uploadDir = path.join(process.cwd(), "public", "uploads");

async function ensureDir() {
  await fs.mkdir(uploadDir, { recursive: true });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function listMedia(): Promise<MediaAsset[]> {
  await ensureDir();
  const entries = await fs.readdir(uploadDir);
  const assets = await Promise.all(
    entries
      .filter((name) => !name.startsWith("."))
      .map(async (name) => {
        const filePath = path.join(uploadDir, name);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const stats = await fs.stat(filePath);
        return {
          filename: name,
          url: `/uploads/${name}`,
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        } satisfies MediaAsset;
      }),
  );
  return assets.sort((a, b) => (a.modifiedAt > b.modifiedAt ? -1 : 1));
}

export async function saveMedia(originalName: string, fileBuffer: Buffer): Promise<MediaAsset> {
  await ensureDir();
  const baseName = slugify(originalName || "media");
  const filename = `${baseName || "asset"}-${Date.now()}.webp`;
  const filePath = path.join(uploadDir, filename);

  const image = sharp(fileBuffer, { failOn: "none" });
  const metadata = await image.metadata();

  await image
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(filePath);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const stats = await fs.stat(filePath);
  return {
    filename,
    url: `/uploads/${filename}`,
    size: stats.size,
    modifiedAt: stats.mtime.toISOString(),
    width: metadata.width,
    height: metadata.height,
  };
}

export async function deleteMedia(filename: string) {
  await ensureDir();
  const filePath = path.join(uploadDir, path.basename(filename));
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.unlink(filePath);
  } catch (error) {
    // If file doesn't exist, that's fine - the goal is achieved
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
