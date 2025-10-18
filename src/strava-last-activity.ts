import * as path from 'path';
import { getLatestStravaActivity } from 'strava/getLatestStravaActivity';
import { EOL } from 'os';

const stravaConfigPath = path.join(process.cwd(), 'etc/strava_config.json');

(async function main() {
  const latestStravaActivity = await getLatestStravaActivity(stravaConfigPath);
  if (!latestStravaActivity) {
    process.stdout.write('Failed to fetch strava data' + EOL);
    process.exit(1);
  }

  process.stdout.write(`Latest strava activity name: ${latestStravaActivity.name}` + EOL);
})();
