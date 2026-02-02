import { GarminConnectClient, GearItem } from 'features/garmin/client';
import { logErrorMessage, logSuccessMessage, logVerboseMessage } from 'utils/log';
import { exit, argv } from 'process';

(async function main() {
  const gcClient = new GarminConnectClient();

  const args = argv.slice(2);

  const [filename] = args;

  try {
    await gcClient.initialize();

    logVerboseMessage(`Importing activity: ${filename}`);

    const userProfile = await gcClient.getUserProfile();
    logVerboseMessage('Garmin user  ' + userProfile.userProfileFullName);

    const uploadedActivityId = await gcClient.uploadActivity(filename);

    if (!uploadedActivityId) {
      throw new Error(`Error uploading activity from file ${filename}`);
    }

    logSuccessMessage('Activity uploaded with id ' + uploadedActivityId);
  } catch (error) {
    logErrorMessage(error);
    exit(1);
  }
})();
