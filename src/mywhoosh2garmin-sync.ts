import { getLatestStravaActivity } from 'strava/getLatestActivity';
import { getLastestActivityFile } from 'mywhoosh/getLastestActivityFile';
import { getDataPath } from 'mywhoosh/getDataPath';
import { GarminConnectClient, GearItem } from 'garmin/client';
import * as presets from '../etc/garmin_presets.json';

(async function main() {
  const myWhooshDataPath = getDataPath();
  const latestActivityFile = await getLastestActivityFile(myWhooshDataPath);
  const latestStravaActivity = await getLatestStravaActivity();
  if (!latestStravaActivity) {
    process.stdout.write('Failed to load latest strava activity');
    process.exit(1);
  }
  const gcClient = new GarminConnectClient();
  try {
    await gcClient.initialize();
  } catch (error) {
    process.stdout.write(error instanceof Error ? error.message : JSON.stringify(error));
    process.exit(1);
  }
  const userProfile = await gcClient.getUserProfile();
  const uploadedActivityId = await gcClient.uploadActivity(latestActivityFile);
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
})();
