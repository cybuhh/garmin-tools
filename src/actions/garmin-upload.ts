import { argv } from 'process';
import { getGarminClient } from 'features/garmin/client';
import { logSuccessMessage, logVerboseMessage } from 'utils/log';
import { initErrorHandler } from 'utils/error';

initErrorHandler();

(async function main() {
  const gcClient = await getGarminClient();

  const [filename] = argv.slice(2);

  await gcClient.initialize();

  logVerboseMessage(`Importing activity: ${filename}`);

  const userProfile = await gcClient.getUserProfile();
  logVerboseMessage('Garmin user  ' + userProfile.userProfileFullName);

  const uploadedActivityId = await gcClient.uploadActivity(filename);

  if (!uploadedActivityId) {
    throw new Error(`Error uploading activity from file ${filename}`);
  }

  logSuccessMessage('Activity uploaded with id ' + uploadedActivityId);
})();
