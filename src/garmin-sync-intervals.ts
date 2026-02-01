import chalk from 'chalk';
import { unlink, rename } from 'fs/promises';
import { GarminConnectClient, GearItem } from 'garmin/client';
import { intervalsIcu } from 'intervalsIcu/intervalsIcu';
import { createChangedActivity } from 'fit/createChangedActivity';
import * as intervalsIcuConfig from '../etc/intervals_icu_config.json';
import * as presets from '../etc/garmin_presets.json';
import * as device from '../etc/device.json';
import { logErrorMessage, logSuccessMessage, logVerboseMessage } from 'utils/log';
import { exit, argv } from 'process';

const REMOVE_ORIGIN_OPTION = '--remove-origin';

(async function main() {
  const intervalsClient = intervalsIcu(intervalsIcuConfig);
  const gcClient = new GarminConnectClient();

  const args = argv.slice(2);

  const isRemoveOrigin = args.includes(REMOVE_ORIGIN_OPTION);

  const actividyId = isRemoveOrigin ? args.filter((arg) => arg !== REMOVE_ORIGIN_OPTION).slice(-1)[0] : args[args.length - 1];

  try {
    const { id, name, filename, date } = actividyId ? await intervalsClient.getActivityDetails(actividyId) : await intervalsClient.getLatestActivity();

    if (!id || !name || !filename || !date) {
      throw new Error(`Activity missing some data. ${JSON.stringify({ id, name, filename, date })}`);
    }

    logVerboseMessage(`Importing activity: ${date} - ` + chalk.blue(name));

    const activityFilename = filename.endsWith('.fit') ? filename : `${filename}.fit`;
    await intervalsClient.downloadOriginalActivityFile(id, activityFilename);
    logSuccessMessage('Activity imported to file: ' + chalk.blue(activityFilename));

    await gcClient.initialize();
    const userProfile = await gcClient.getUserProfile();
    logVerboseMessage('Garmin user  ' + userProfile.userProfileFullName);

    const backupFilename = `${activityFilename}.bak`;
    await rename(activityFilename, backupFilename);
    await createChangedActivity(backupFilename, activityFilename, device);

    logSuccessMessage('Updated activity device to  ' + device.garminProduct);

    const uploadedActivityId = await gcClient.uploadActivity(activityFilename);
    if (!uploadedActivityId) {
      throw new Error(`Error uploading activity from file ${activityFilename}`);
    }

    await unlink(activityFilename);
    await unlink(backupFilename);
    logSuccessMessage('Activity uploaded with id ' + uploadedActivityId);

    if (isRemoveOrigin) {
      await intervalsClient.deleteActivity(id);
      logSuccessMessage('Removed activity from origin ' + id);
    }

    await gcClient.updateLatestActivityName(uploadedActivityId, name);

    if ('indoor' in presets && presets.indoor) {
      const { indoor: indoorPreset } = presets;

      const activityGear = await gcClient.getGear({ profileId: userProfile.profileId });

      await activityGear.reduce<Promise<unknown>>(async (promise, gear: GearItem) => {
        await promise;
        return gcClient.unlinkGear(gear.uuid, uploadedActivityId);
      }, Promise.resolve());

      await indoorPreset.reduce<Promise<unknown>>(async (promise, gear: GearItem) => {
        await promise;
        return gcClient.linkGear(gear.uuid, uploadedActivityId);
      }, Promise.resolve());

      logSuccessMessage('Activity gear updated successfully' + device.garminProduct);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    logErrorMessage(errorMessage);
    exit(1);
  }
})();
