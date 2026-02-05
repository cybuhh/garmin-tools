import { getGarminClient } from 'features/garmin/client';
import { logMessage } from 'utils/log';
import { initErrorHandler } from 'utils/error';

initErrorHandler();

(async function main() {
  const gcClient = await getGarminClient();
  const [activity] = await gcClient.getActivities(0, 1);
  logMessage(JSON.stringify(activity));
})();
