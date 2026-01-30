import { GarminConnectClient, GearItem } from 'garmin/client';
import * as path from 'path';
import { StravaClient } from 'strava/StravaClient';
import { EOL } from 'os';
import * as stravaConfig from '../etc/strava_config.json';

const stravaConfigPath = path.join(process.cwd(), 'etc/strava_config.json');

(async function main() {
  const stravaClient = new StravaClient(stravaConfigPath, stravaConfig);
  const gcClient = new GarminConnectClient();

  try {
    await stravaClient.getAthlete();
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 401) {
      process.stdout.write('👀 Refreshing token' + EOL);
      await stravaClient.tokenRefresh();
      process.stdout.write('✅ Strava Token refreshed.');
    }
  }

  try {
    await gcClient.initialize();
    const [{ activityId, activityName }] = await gcClient.getActivities(0, 1);

    const { id, name } = await stravaClient.getLatestActivity();
    if (!id || !name) {
      process.stdout.write('Failed to fetch strava data' + EOL);
      process.exit(1);
    }

    const activityPhoto = await stravaClient.getActivityPhoto(id);

    const imageResponse = await fetch(activityPhoto);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    const imageBlob = await imageResponse.blob();
    const result = await gcClient.addPhoto(activityId, imageBlob);

    process.stdout.write(`Latest strava activity name: ${name}` + EOL);
    process.stdout.write(`Latest strava activity photo: ${activityPhoto}` + EOL);
    process.stdout.write(`Latest garmin activity name: ${activityName}` + EOL);
    process.stdout.write(`Uploaded image id: ${result.imageId}` + EOL);
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 401) {
      process.stdout.write('👀 Refreshing token' + EOL);
      await stravaClient.tokenRefresh();
      process.stdout.write('✅ Token refreshed. Please re-run app.');
    }
    const errorMessage = error instanceof Error ? error.message : error;
    process.stderr.write('☠️ Error occured. ' + errorMessage + EOL);
    console.error(error);
    process.exit(1);
  }
})();
