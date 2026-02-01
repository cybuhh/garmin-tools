import * as path from 'path';
import { exit } from 'process';
import { StravaClient } from 'strava/StravaClient';
import * as stravaConfig from '../../etc/strava_config.json';
import { logErrorMessage, logMessage, logSuccessMessage, logVerboseMessage } from 'utils/log';

const stravaConfigPath = path.join(process.cwd(), 'etc/strava_config.json');

(async function main() {
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

  try {
    const { id, name } = await stravaClient.getLatestActivity();
    if (!id || !name) {
      logErrorMessage('Failed to fetch strava data');
      exit(1);
    }

    const activityPhoto = await stravaClient.getActivityPhoto(id);

    logMessage(`Latest strava activity name: ${name}`);
    logMessage(`Latest strava activity photo: ${activityPhoto}`);
  } catch (error) {
    logErrorMessage(error);
    exit(1);
  }
})();
