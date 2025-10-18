import { readFile } from 'fs/promises';
import { EOL } from 'os';
import { StravaClient } from 'strava/StravaClient';

export async function getLatestStravaActivity(stravaConfigPath: string) {
  const stravaConfig = JSON.parse((await readFile(stravaConfigPath)).toString());

  const stravaClient = new StravaClient(stravaConfigPath, stravaConfig);
  try {
    const latestStravaActivity = await stravaClient.getLatestActivity();
    return latestStravaActivity;
  } catch (e) {
    if (e instanceof Error && 'statusCode' in e && e.statusCode === 401) {
      process.stdout.write('Refreshing token' + EOL);
      await stravaClient.tokenRefresh();
      process.exit(1);
    }
    process.stdout.write('Strava error occured' + EOL);
    process.stdout.write(JSON.stringify(e) + EOL);
  }
}
