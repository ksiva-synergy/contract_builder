import { mkdir, writeFile, readFile, unlink, stat } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.WS_UPLOAD_DIR || "./uploads";

async function ensureDir(dir: string) {
  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // directory exists
  }
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  subDir: string = "documents"
): Promise<{ filePath: string; fileName: string; fileSize: number }> {
  const dir = join(UPLOAD_DIR, subDir);
  await ensureDir(dir);

  const ext = originalName.split(".").pop() || "bin";
  const fileName = `${randomUUID()}.${ext}`;
  const filePath = join(dir, fileName);

  await writeFile(filePath, buffer);
  const stats = await stat(filePath);

  return { filePath, fileName: originalName, fileSize: stats.size };
}

export async function getFile(filePath: string): Promise<Buffer> {
  return readFile(filePath);
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    // file may not exist
  }
}

export async function getFileSize(filePath: string): Promise<number> {
  const stats = await stat(filePath);
  return stats.size;
}
