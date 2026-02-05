import { existsSync } from 'fs';
import { mkdir, readFile } from 'fs/promises';
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

export async function importConfig<T>(configPath: string) {
  try {
    const fileContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(fileContent) as T;
    return config;
  } catch (error) {
    throw Error('Failed to import config from ' + configPath + '. ' + (error instanceof Error ? error.message : error));
  }
}
