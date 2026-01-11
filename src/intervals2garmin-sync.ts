import { EOL } from 'os';
import chalk from 'chalk';
import { unlink, rename } from 'fs/promises';
import { GarminConnectClient, GearItem } from 'garmin/client';
import { intervalsIcu } from 'intervalsIcu/intervalsIcu';
import { createChangedActivity } from 'fit/createChangedActivity';
import * as intervalsIcuConfig from '../etc/intervals_icu_config.json';
import * as presets from '../etc/garmin_presets.json';
import * as device from '../etc/device.json';

const KEEP_ORIGIN_OPTION = '--keep-origin';

(async function main() {
  const intervalsClient = intervalsIcu(intervalsIcuConfig);
  const gcClient = new GarminConnectClient();

  const args = process.argv.slice(2);

  const isKeepOrigin = args.includes(KEEP_ORIGIN_OPTION);

  const actividyId = isKeepOrigin ? args.filter((arg) => arg !== KEEP_ORIGIN_OPTION).slice(-1)[0] : args[args.length - 1];

  try {
    const { id, name, filename, date } = actividyId ? await intervalsClient.getActivityDetails(actividyId) : await intervalsClient.getLatestActivity();

    if (!id || !name || !filename || !date) {
      throw new Error(`Activity missing some data. ${JSON.stringify({ id, name, filename, date })}`);
    }

    process.stdout.write(`👀 Importing activity: ${date} - ` + chalk.blue(name) + EOL);

    await intervalsClient.downloadOriginalActivityFile(id, filename);
    process.stdout.write('✅ Activity imported to file: ' + chalk.blue(filename) + EOL);

    await gcClient.initialize();
    const userProfile = await gcClient.getUserProfile();
    process.stdout.write(`👀 Garmin user: ${userProfile.userProfileFullName}` + EOL);

    const backupFilename = `${filename}.bak`;
    await rename(filename, backupFilename);
    await createChangedActivity(backupFilename, filename, device);

    process.stdout.write(`✅ Updated activity device to ${device.garminProduct}` + EOL);

    if (!isKeepOrigin) {
      await intervalsClient.deleteActivity(id);
      process.stdout.write(`🧹 Removed activty from origin ${id}` + EOL);
    }

    const uploadedActivityId = await gcClient.uploadActivity(filename);
    if (!uploadedActivityId) {
      throw new Error(`Error uploading activity from file ${filename}`);
    }
    await unlink(filename);
    await unlink(backupFilename);
    process.stdout.write(`✅ Activity uploaded with id ${uploadedActivityId}` + EOL);

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

      process.stdout.write(`✅ Activity gear updated successfully` + EOL);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    process.stderr.write('☠️ Error occured. ' + errorMessage + EOL);
    process.exit(1);
  }
})();
