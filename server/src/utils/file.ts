import { promises as fs } from "fs";

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}
