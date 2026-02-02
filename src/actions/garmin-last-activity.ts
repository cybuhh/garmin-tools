import { getGarminClient } from 'features/garmin/client';
import { logErrorMessage, logMessage } from 'utils/log';
import { exit } from 'process';

(async function main() {
  try {
    const gcClient = await getGarminClient();
    const activities = await gcClient.getActivities(0, 1);
    logMessage(JSON.stringify(activities[0]));
  } catch (error) {
    logErrorMessage(error);
    exit(1);
  }
})();
