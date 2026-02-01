import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { cwd } from 'process';

const TMP_PATH = '_tmp_';

export function getTmpPath(filename: string) {
  return path.join(cwd(), TMP_PATH, filename);
}

export function createTmpPathIfNotExists() {
  const fullPath = path.join(cwd(), TMP_PATH);
  if (!existsSync(fullPath)) {
    return mkdir(fullPath, { recursive: true });
  }
}
