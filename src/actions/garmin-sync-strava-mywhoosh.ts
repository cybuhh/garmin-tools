import { getLastestActivityFile } from 'features/mywhoosh/getLastestActivityFile';
import { getDataPath } from 'features/mywhoosh/getDataPath';
import { GarminConnectClient, GearItem } from 'features/garmin/client';
import * as presets from '../../etc/garmin_presets.json';
import * as stravaConfig from '../../etc/strava_config.json';
import * as path from 'path';
import { StravaClient } from 'features/strava/StravaClient';
import { logErrorMessage, logSuccessMessage, logMessage, logVerboseMessage } from 'utils/log';
import { exit, cwd } from 'process';

const stravaConfigPath = path.join(cwd(), 'etc/strava_config.json');

(async function main() {
  const myWhooshDataPath = getDataPath();
  const stravaClient = new StravaClient(stravaConfigPath, stravaConfig);
  try {
    await stravaClient.getAthlete();
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 401) {
      logVerboseMessage('Refreshing token');
      await stravaClient.tokenRefresh();
      logSuccessMessage('Strava Token refreshed.');
    }
  }

  const gcClient = new GarminConnectClient();

  try {
    const latestActivityFile = await getLastestActivityFile(myWhooshDataPath);
    logSuccessMessage(`Latest activity file found: ${latestActivityFile}`);

    const latestStravaActivity = await stravaClient.getLatestActivity();

    if (!latestStravaActivity) {
      throw new Error('Failed to load latest strava activity');
    }

    logMessage(`Latest strava activity name: ${latestStravaActivity.name}`);

    await gcClient.initialize();
    const userProfile = await gcClient.getUserProfile();
    const uploadedActivityId = await gcClient.uploadActivity(latestActivityFile);
    if (!uploadedActivityId) {
      throw new Error(`Error uploading activity from file ${latestActivityFile}`);
    }
    logSuccessMessage(`Activity uploaded with id ${uploadedActivityId}`);

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
      logVerboseMessage('Refreshing token');
      await stravaClient.tokenRefresh();
      logSuccessMessage('Token refreshed. Please re-run app.');
      exit(0);
    }
    logErrorMessage(error);
    exit(1);
  }
})();
