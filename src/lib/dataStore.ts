import { promises as fs } from "node:fs";
import path from "node:path";
import { CmsData } from "@/types/cms";
import { CMS_CACHE_TTL_MS } from "./constants";

const dataPath = path.join(process.cwd(), "data", "cms.json");

let cachedCms: CmsData | null = null;
let lastLoaded = 0;

async function readCmsFromDisk() {
  const file = await fs.readFile(dataPath, "utf-8");
  cachedCms = JSON.parse(file) as CmsData;
  lastLoaded = Date.now();
  return cachedCms;
}

export async function getCmsData(): Promise<CmsData> {
  if (!cachedCms || Date.now() - lastLoaded > CMS_CACHE_TTL_MS) {
    await readCmsFromDisk();
  }
  return structuredClone(cachedCms!);
}

export async function saveCmsData(data: CmsData) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
  cachedCms = data;
  lastLoaded = Date.now();
}
