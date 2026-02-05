import chalk from 'chalk';
import { unlink, rename } from 'fs/promises';
import { argv } from 'process';
import { GearItem, GearLinkResponse } from 'types/garmin';
import { getGarminClient } from 'features/garmin/client';
import { intervalsIcu } from 'features/intervalsIcu/intervalsIcu';
import { createChangedActivity } from 'features/fit/createChangedActivity';
import { logSuccessMessage, logVerboseMessage } from 'utils/log';
import { createTmpPathIfNotExists, getTmpPath, importConfig } from 'utils/fs';
import { GarminDevice, GarminPreset, IntervalsIcuConfig } from 'types/config';
import { initErrorHandler } from 'utils/error';

const REMOVE_ORIGIN_OPTION = '--remove-origin';

initErrorHandler();

(async function main() {
  const intervalsIcuConfig = await importConfig<IntervalsIcuConfig>('./etc/intervals_icu_config.json');
  const presets = await importConfig<GarminPreset>('./etc/garmin_presets.json');
  const device = await importConfig<GarminDevice>('./etc/device.json');

  const intervalsClient = intervalsIcu(intervalsIcuConfig);

  const args = argv.slice(2);

  const isRemoveOrigin = args.includes(REMOVE_ORIGIN_OPTION);

  const actividyId = isRemoveOrigin ? args.filter((arg) => arg !== REMOVE_ORIGIN_OPTION).slice(-1)[0] : args[args.length - 1];

  const { id, name, filename, date } = actividyId ? await intervalsClient.getActivityDetails(actividyId) : await intervalsClient.getLatestActivity();
  if (!id || !name || !filename || !date) {
    throw new Error(`Activity missing some data. ${JSON.stringify({ id, name, filename, date })}`);
  }

  logVerboseMessage(`Importing activity: ${date} - ` + chalk.blue(name));
  await createTmpPathIfNotExists();
  const activityFilename = getTmpPath(filename.endsWith('.fit') ? filename : `${filename}.fit`);

  await intervalsClient.downloadOriginalActivityFile(id, activityFilename);
  logSuccessMessage('Activity imported to file: ' + chalk.blue(activityFilename));

  const gcClient = await getGarminClient();
  const userProfile = await gcClient.getUserProfile();
  logVerboseMessage('Garmin user  ' + userProfile.userProfileFullName);

  const backupFilename = `${activityFilename}.bak`;
  await rename(activityFilename, backupFilename);
  await createChangedActivity(backupFilename, activityFilename, device);
  logSuccessMessage(`Updated activity device to ${device.garminProduct}`);

  const uploadedActivityId = await gcClient.uploadActivity(activityFilename);
  if (!uploadedActivityId) {
    throw new Error(`Error uploading activity from file ${activityFilename}`);
  }
  logSuccessMessage('Activity uploaded with id ' + uploadedActivityId);

  await unlink(activityFilename);
  await unlink(backupFilename);

  if (isRemoveOrigin) {
    await intervalsClient.deleteActivity(id);
    logSuccessMessage('Removed activity from origin ' + id);
  }

  await gcClient.updateLatestActivityName(uploadedActivityId, name);

  if (presets && 'indoor' in presets && presets.indoor) {
    const { indoor: indoorPreset } = presets;

    const activityGear = await gcClient.getGear({ profileId: userProfile.profileId });

    await activityGear.reduce<Promise<GearLinkResponse | void>>(async (promise, gear: GearItem) => {
      await promise;
      return gcClient.unlinkGear(gear.uuid, uploadedActivityId);
    }, Promise.resolve());

    await indoorPreset.reduce<Promise<GearLinkResponse | void>>(async (promise, gear: GearItem) => {
      await promise;
      return gcClient.linkGear(gear.uuid, uploadedActivityId);
    }, Promise.resolve());

    logSuccessMessage(`Activity gear updated successfully ${device.garminProduct}`);
  }
})();
