import { exit, argv, cwd } from 'process';
import * as path from 'path';
import { GarminConnectClient } from 'features/garmin/client';
import { StravaClient } from 'features/strava/StravaClient';
import { logErrorMessage, logSuccessMessage, logVerboseMessage } from 'utils/log';
import * as stravaConfig from '../../etc/strava_config.json';

const stravaConfigPath = path.join(cwd(), 'etc/strava_config.json');

(async function main() {
  const stravaClient = new StravaClient(stravaConfigPath, stravaConfig);
  const gcClient = new GarminConnectClient();

  try {
    await stravaClient.getAthlete();
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 401) {
      logVerboseMessage('Refreshing token');
      await stravaClient.tokenRefresh();
      logSuccessMessage('Strava Token refreshed.');
    }
  }

  try {
    await gcClient.initialize();

    const args = argv.slice(2);
    const garminActivityIdParam = Number(args[0]);
    const stravaActivityIdParam = args[1];

    const { activityId: garminActivityId, activityName } = garminActivityIdParam ? await gcClient.getActivity({ activityId: garminActivityIdParam }) : (await gcClient.getActivities(0, 1))[0];
    logVerboseMessage(`Latest garmin activity name: ${activityName}`);

    const { id: stravaActivityId, name: stravaActivityName } = stravaActivityIdParam ? await stravaClient.getActivity(stravaActivityIdParam) : await stravaClient.getLatestActivity();
    if (!stravaActivityId || !stravaActivityName) {
      throw Error('Failed to fetch strava data');
    }
    logVerboseMessage(`Latest strava activity name: ${stravaActivityName}`);

    const activityPhoto = await stravaClient.getActivityPhoto(stravaActivityId);
    logVerboseMessage(`Latest strava activity photo: ${activityPhoto}`);

    const imageResponse = await fetch(activityPhoto);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    const imageBlob = await imageResponse.blob();
    const result = await gcClient.addPhoto(garminActivityId, imageBlob);
    logVerboseMessage(`Uploaded image id: ${result.imageId}`);
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 401) {
      logVerboseMessage('👀 Refreshing token');
      await stravaClient.tokenRefresh();
      logSuccessMessage('Token refreshed. Please re-run app.');
    }
    logErrorMessage(error);
    exit(1);
  }
})();
