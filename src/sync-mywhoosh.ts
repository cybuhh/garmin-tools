import { getLatestStravaActivity } from './strava/getLatestActivity';
import { getLastestActivityFile } from './mywhoosh/getLastestActivityFile';
import { getDataPath } from './mywhoosh/getDataPath';
import { getClient } from './garmin/getClient';
import uploadActivity from './garmin/uploadActivity';
import getUploadedActivityIdFromStatus from './garmin/getUploadedActivityIdFromStatus';
import updateLatestActivityName from './garmin/updateLatestActivityName';

(async function main() {
  const myWhooshDataPath = getDataPath();
  const latestActivityFile = await getLastestActivityFile(myWhooshDataPath);
  const latestStravaActivity = await getLatestStravaActivity();
  if (!latestStravaActivity) {
    console.error('Latest strava activity is missing');
    process.exit(1);
  }

  const gcClient = await getClient();
  const uploadedFileStatusLocation = await uploadActivity(gcClient.client, latestActivityFile);
  const uploadedActivityId = await getUploadedActivityIdFromStatus(gcClient.client, uploadedFileStatusLocation);
  await updateLatestActivityName(gcClient, uploadedActivityId, latestStravaActivity.name);
})();
