import { join } from 'path';
import { Open } from 'unzipper';

export default async function extractActivityFile(activityId: number, directory: string) {
  try {
    const srcFilename = join(directory, `${activityId}.zip`);
    const dstFilename = join(directory, `${activityId}_ACTIVITY.fit`);

    const centralDirectory = await Open.file(srcFilename);
    await centralDirectory.extract({ path: directory });

    return dstFilename;
  } catch (err) {
    console.error(err);
  }
}
