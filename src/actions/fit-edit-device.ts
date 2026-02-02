import { rename } from 'fs/promises';
import { argv } from 'process';
import { createChangedActivity } from 'features/fit/createChangedActivity';
import { logSuccessMessage } from 'utils/log';
import * as device from '../../etc/device.json';

(async function main() {
  const [filename] = argv.slice(2);
  const backupFilename = `${filename}.bak`;

  await rename(filename, backupFilename);

  await createChangedActivity(backupFilename, filename, device);
  logSuccessMessage(`Updated activity device to ${device.garminProduct}`);
})();
