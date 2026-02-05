import { logErrorMessage, logMessage } from 'utils/log';
import { GarminConnectClient } from 'features/garmin/client';
import { initErrorHandler } from 'utils/error';

initErrorHandler();

(async function main() {
  const gcClient = new GarminConnectClient();
  await gcClient.initialize();
  const userProfile = await gcClient.getUserProfile();
  logMessage(`user: ${userProfile.fullName}`);
})();
