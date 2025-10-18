import { getLastestActivityFile } from 'mywhoosh/getLastestActivityFile';
import { getDataPath } from 'mywhoosh/getDataPath';
import { GarminConnectClient } from 'garmin/client';

(async function main() {
  const gcClient = new GarminConnectClient();
  try {
    await gcClient.initialize();
  } catch (error) {
    process.stdout.write(error instanceof Error ? error.message : JSON.stringify(error));
    process.exit(1);
  }

  const myWhooshDataPath = getDataPath();
  const latestActivityFile = await getLastestActivityFile(myWhooshDataPath);
  const uploadedActivityId = await gcClient.uploadActivity(latestActivityFile);
  process.stdout.write(`New activity uploaded, https://connect.garmin.com/modern/activity/${uploadedActivityId}\n`);
})();
