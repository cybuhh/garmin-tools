import { exit } from 'process';
import delay from 'utils/delay';
import { getGarminClient } from 'services/garmin/client';
import { logErrorMessage, logMessage, logVerboseMessage } from 'utils/log';

const REQUEST_DELAY = 5000;

(async function main() {
  const userId = Number(process.argv[2]);

  if (!userId) {
    logErrorMessage('Missing userId');
    exit(1);
  }

  try {
    const gcClient = await getGarminClient();
    const userDetails = await gcClient.getSocialProfile(userId);
    logVerboseMessage(userDetails.fullName);

    const newsFeed = await gcClient.getActivitiesFromNewsfeed(userId);

    await newsFeed.reduce(
      async (acc, activity) => {
        await acc;
        await delay(REQUEST_DELAY);
        logMessage(`👍 like on ${activity.startTimeLocal} ${activity.activityId} - ${activity.activityName}`);
        return gcClient.likeActivity(activity.activityId);
      },
      Promise.resolve() as unknown as Promise<{}>
    );
  } catch (error) {
    logErrorMessage(error);
    exit(1);
  }
})();
