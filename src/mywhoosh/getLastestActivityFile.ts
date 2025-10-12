import * as fs from 'fs/promises';
import * as path from 'path';

export async function getLastestActivityFile(dirPath: string) {
  const files = await fs.readdir(dirPath);
  const stats = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);
      return { file, time: stat.mtime.getTime(), isFile: stat.isFile() };
    })
  );
  const fileStats = stats.filter((s) => s.isFile);

  if (fileStats.length === 0) {
    throw new Error('No files found in directory');
  }

  fileStats.sort((a, b) => b.time - a.time);

  const lastestActivityFilename = fileStats[0].file;

  return path.join(dirPath, lastestActivityFilename);
}
