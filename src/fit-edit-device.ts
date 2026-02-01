import { rename } from 'fs/promises';
import { createChangedActivity } from 'fit/createChangedActivity';
import { logSuccessMessage } from 'common/log';
import * as device from '../etc/device.json';

(async function main() {
  const args = process.argv.slice(2);
  const [filename] = args;
  const backupFilename = `${filename}.bak`;

  await rename(filename, backupFilename);

  await createChangedActivity(backupFilename, filename, device);
  logSuccessMessage(`Updated activity device to ${device.garminProduct}`);
})();
