import * as path from 'path';
import { exit } from 'process';
import { StravaClient, StravaConfig } from 'features/strava/StravaClient';
import { logErrorMessage, logMessage, logSuccessMessage, logVerboseMessage } from 'utils/log';
import { importConfig } from 'utils/fs';
import { initErrorHandler } from 'utils/error';

const stravaConfigPath = path.join(process.cwd(), 'etc/strava_config.json');

initErrorHandler();

(async function main() {
  const stravaConfig = await importConfig<StravaConfig>('./etc/strava_config.json');
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

  const { id, name } = await stravaClient.getLatestActivity();
  if (!id || !name) {
    throw new Error();
  }

  const activityPhoto = await stravaClient.getActivityPhoto(id);

  logMessage(`Latest strava activity name: ${name}`);
  logMessage(`Latest strava activity photo: ${activityPhoto}`);
})();
