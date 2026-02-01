import { exit } from 'process';
import { getLastestActivityFile } from 'services/mywhoosh/getLastestActivityFile';
import { getDataPath } from 'services/mywhoosh/getDataPath';
import { GarminConnectClient } from 'services/garmin/client';
import { logErrorMessage, logSuccessMessage } from 'utils/log';

(async function main() {
  const gcClient = new GarminConnectClient();
  try {
    await gcClient.initialize();
  } catch (error) {
    logErrorMessage(error);
    exit(1);
  }

  const myWhooshDataPath = getDataPath();
  const latestActivityFile = await getLastestActivityFile(myWhooshDataPath);
  const uploadedActivityId = await gcClient.uploadActivity(latestActivityFile);
  logSuccessMessage(`New activity uploaded, https://connect.garmin.com/modern/activity/${uploadedActivityId}`);
})();
