import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveFile(
  file: File,
  subDir: string
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subDir);
  await mkdir(dir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filePath = path.join(dir, uniqueName);

  await writeFile(filePath, buffer);

  return `/uploads/${subDir}/${uniqueName}`;
}

export function getFileType(filename: string): "image" | "model" | "other" {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext))
    return "image";
  if ([".glb", ".gltf"].includes(ext)) return "model";
  return "other";
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
export const ALLOWED_MODEL_TYPES = ["model/gltf-binary", "model/gltf+json"];
