import { getLastestActivityFile } from 'mywhoosh/getLastestActivityFile';
import { getDataPath } from 'mywhoosh/getDataPath';
import { GarminConnectClient, GearItem } from 'garmin/client';
import * as presets from '../etc/garmin_presets.json';
import * as stravaConfig from '../etc/strava_config.json';
import * as path from 'path';
import { EOL } from 'os';
import { StravaClient } from 'strava/StravaClient';

const stravaConfigPath = path.join(process.cwd(), 'etc/strava_config.json');

(async function main() {
  const myWhooshDataPath = getDataPath();
  const stravaClient = new StravaClient(stravaConfigPath, stravaConfig);

  const gcClient = new GarminConnectClient();

  try {
    const latestActivityFile = await getLastestActivityFile(myWhooshDataPath);
    process.stdout.write(`✅ Latest activity file found: ${latestActivityFile}` + EOL);

    const latestStravaActivity = await stravaClient.getLatestActivity();

    if (!latestStravaActivity) {
      throw new Error('Failed to load latest strava activity');
    }

    process.stdout.write(`Latest strava activity name: ${latestStravaActivity.name}` + EOL);

    await gcClient.initialize();
    const userProfile = await gcClient.getUserProfile();
    const uploadedActivityId = await gcClient.uploadActivity(latestActivityFile);
    if (!uploadedActivityId) {
      throw new Error(`Error uploading activity from file ${latestActivityFile}`);
    }
    process.stdout.write(`✅ Activity uploaded with id ${uploadedActivityId}` + EOL);

    await gcClient.updateLatestActivityName(uploadedActivityId, latestStravaActivity.name);

    const activityGear = await gcClient.getGear({ profileId: userProfile.profileId });

    await activityGear.reduce<Promise<unknown>>(async (promise, gear: GearItem) => {
      await promise;
      return gcClient.unlinkGear(gear.uuid, uploadedActivityId);
    }, Promise.resolve());

    await presets.indoor.reduce<Promise<unknown>>(async (promise, gear: GearItem) => {
      await promise;
      return gcClient.linkGear(gear.uuid, uploadedActivityId);
    }, Promise.resolve());
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 401) {
      process.stdout.write('👀 Refreshing token' + EOL);
      await stravaClient.tokenRefresh();
      process.stdout.write('✅ Token refreshed. Please re-run app.');
    }
    const errorMessage = error instanceof Error ? error.message : error;
    process.stderr.write('☠️ Error occured. ' + errorMessage + EOL);
    process.exit(1);
  }
})();
