import { GarminConnectClient } from 'garmin/client';
import { EOL } from 'os';

(async function main() {
  const userId = Number(process.argv[2]);

  if (!userId) {
    process.stdout.write(`☠️ Missing userId` + EOL);
    process.exit(1);
  }

  const gcClient = new GarminConnectClient();

  try {
    await gcClient.initialize();
    const userDetails = await gcClient.getSocialProfile(userId);
    process.stdout.write(`👀 ${userDetails.fullName}` + EOL);

    const newsFeed = await gcClient.getActivitiesFromNewsfeed(userId);

    await newsFeed.reduce(
      async (acc, activity) => {
        await acc;
        process.stdout.write(`👍 like on ${activity.startTimeLocal} ${activity.activityId} - ${activity.activityName}` + EOL);
        return gcClient.likeActivity(activity.activityId);
      },
      Promise.resolve() as unknown as Promise<{}>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    process.stderr.write('☠️ Error occured. ' + errorMessage + EOL);
    process.exit(1);
  }
})();
