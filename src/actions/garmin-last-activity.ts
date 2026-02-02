import { exit } from 'process';
import { getGarminClient } from 'features/garmin/client';
import { logErrorMessage, logMessage } from 'utils/log';

(async function main() {
  try {
    const gcClient = await getGarminClient();
    const [activity] = await gcClient.getActivities(0, 1);
    logMessage(JSON.stringify(activity));
  } catch (error) {
    logErrorMessage(error);
    exit(1);
  }
})();
