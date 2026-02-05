import { exit } from 'process';
import { getLastestActivityFile } from 'features/mywhoosh/getLastestActivityFile';
import { getDataPath } from 'features/mywhoosh/getDataPath';
import { getGarminClient } from 'features/garmin/client';
import { logSuccessMessage } from 'utils/log';
import { initErrorHandler } from 'utils/error';

initErrorHandler();

(async function main() {
  const gcClient = await getGarminClient();

  const myWhooshDataPath = getDataPath();
  const latestActivityFile = await getLastestActivityFile(myWhooshDataPath);
  const uploadedActivityId = await gcClient.uploadActivity(latestActivityFile);
  logSuccessMessage(`New activity uploaded, https://connect.garmin.com/modern/activity/${uploadedActivityId}`);
})();
