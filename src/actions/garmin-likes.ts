import { exit, argv } from 'process';
import delay from 'utils/delay';
import { getGarminClient } from 'features/garmin/client';
import { logErrorMessage, logMessage, logVerboseMessage } from 'utils/log';
import { initErrorHandler } from 'utils/error';

const REQUEST_DELAY = 5000;
const FULL_NAME = 'cybuhh';

initErrorHandler();

(async function main() {
  const userId = Number(argv[2]);

  if (!userId) {
    logErrorMessage('Missing userId');
    exit(1);
  }

  const gcClient = await getGarminClient();
  const userDetails = await gcClient.getSocialProfile(userId);
  logVerboseMessage(userDetails.fullName);

  const newsFeed = await gcClient.getActivitiesFromNewsfeed(userId);

  await newsFeed.reduce(
    async (acc, activity) => {
      await acc;

      const { activityLikeFullNames = [] } = activity;

      if ((activityLikeFullNames as string[]).includes(FULL_NAME)) {
        logMessage(`skipping 👍 like on ${activity.startTimeLocal} ${activity.activityId} - ${activity.activityName}`);
        return Promise.resolve() as unknown as Promise<{}>;
      }
      await delay(REQUEST_DELAY);
      logMessage(`👍 like on ${activity.startTimeLocal} ${activity.activityId} - ${activity.activityName}`);
      return gcClient.likeActivity(activity.activityId);
    },
    Promise.resolve() as unknown as Promise<{}>
  );
})();
