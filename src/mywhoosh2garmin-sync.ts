import { getLastestActivityFile } from 'mywhoosh/getLastestActivityFile';
import { getDataPath } from 'mywhoosh/getDataPath';
import { GarminConnectClient, GearItem } from 'garmin/client';
import * as presets from '../etc/garmin_presets.json';
import * as path from 'path';
import { getLatestStravaActivity } from 'strava/getLatestStravaActivity';
import { EOL } from 'os';

const stravaConfigPath = path.join(process.cwd(), 'etc/strava_config.json');

(async function main() {
  const myWhooshDataPath = getDataPath();
  const latestActivityFile = await getLastestActivityFile(myWhooshDataPath);
  process.stdout.write(`Latest activity file found: ${latestActivityFile}` + EOL);

  const latestStravaActivity = await getLatestStravaActivity(stravaConfigPath);

  if (!latestStravaActivity) {
    process.stdout.write('Failed to load latest strava activity' + EOL);
    process.exit(1);
  }

  process.stdout.write(`Latest strava activity name: ${latestStravaActivity.name}` + EOL);

  const gcClient = new GarminConnectClient();
  try {
    await gcClient.initialize();
  } catch (error) {
    process.stdout.write((error instanceof Error ? error.message : JSON.stringify(error)) + EOL);
    process.exit(1);
  }

  const userProfile = await gcClient.getUserProfile();
  const uploadedActivityId = await gcClient.uploadActivity(latestActivityFile);
  if (!uploadedActivityId) {
    process.stdout.write(`Error uploading activity from file ${latestActivityFile}` + EOL);
    process.exit(1);
  }
  process.stdout.write(`Activity uploaded with id ${uploadedActivityId}` + EOL);

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
