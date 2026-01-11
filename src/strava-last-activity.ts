import * as path from 'path';
import { StravaClient } from 'strava/StravaClient';
import { EOL } from 'os';
import * as stravaConfig from '../etc/strava_config.json';

const stravaConfigPath = path.join(process.cwd(), 'etc/strava_config.json');

(async function main() {
  const stravaClient = new StravaClient(stravaConfigPath, stravaConfig);

  try {
    const { id, name } = await stravaClient.getLatestActivity();
    if (!id || !name) {
      process.stdout.write('Failed to fetch strava data' + EOL);
      process.exit(1);
    }

    const activityPhoto = await stravaClient.getActivityPhoto(id);

    process.stdout.write(`Latest strava activity name: ${name}` + EOL);
    process.stdout.write(`Latest strava activity photo: ${activityPhoto}` + EOL);
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
