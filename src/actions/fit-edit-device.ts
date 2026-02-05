import { rename } from 'fs/promises';
import { argv } from 'process';
import { createChangedActivity } from 'features/fit/createChangedActivity';
import { logSuccessMessage } from 'utils/log';
import { GarminDevice } from 'types/config';
import { importConfig } from 'utils/fs';

(async function main() {
  const device = await importConfig<GarminDevice>('./etc/device.json');
  const [filename] = argv.slice(2);
  const backupFilename = `${filename}.bak`;

  await rename(filename, backupFilename);

  await createChangedActivity(backupFilename, filename, device);
  logSuccessMessage(`Updated activity device to ${device.garminProduct}`);
})();
