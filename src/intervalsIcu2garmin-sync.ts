import { EOL } from 'os';
import chalk from 'chalk';
import { GarminConnectClient, GearItem } from './garmin/client';
import { intervalsIcu } from './intervalsIcu/intervalsIcu';
import { createChangedActivity } from './fit/createChangedActivity';
import * as intervalsIcuConfig from '../etc/intervals_icu_config.json';
import * as presets from '../etc/garmin_presets.json';
import { unlink, rename } from 'fs/promises';
import * as device from '../etc/device.json';

(async function main() {
  const intervalsClient = intervalsIcu(intervalsIcuConfig);
  const gcClient = new GarminConnectClient();

  try {
    const { id, name, filename, date } = await intervalsClient.getLatestActivity();

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

    const uploadedActivityId = await gcClient.uploadActivity(filename);
    if (!uploadedActivityId) {
      throw new Error(`Error uploading activity from file ${filename}`);
    }
    await unlink(filename);
    process.stdout.write(`✅ Activity uploaded with id ${uploadedActivityId}` + EOL);

    await gcClient.updateLatestActivityName(uploadedActivityId, name);

    const activityGear = await gcClient.getGear({ profileId: userProfile.profileId });

    await activityGear.reduce<Promise<unknown>>(async (promise, gear: GearItem) => {
      await promise;
      return gcClient.unlinkGear(gear.uuid, uploadedActivityId);
    }, Promise.resolve());

    await presets.indoor.reduce<Promise<unknown>>(async (promise, gear: GearItem) => {
      await promise;
      return gcClient.linkGear(gear.uuid, uploadedActivityId);
    }, Promise.resolve());

    process.stdout.write(`✅ Activity updated successfully` + EOL);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    process.stderr.write('☠️ Error occured. ' + errorMessage + EOL);
    process.exit(1);
  }
})();
