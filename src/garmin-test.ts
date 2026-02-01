import { logErrorMessage, logMessage } from 'common/log';
import { GarminConnectClient } from 'services/garmin/client';

(async function main() {
  const gcClient = new GarminConnectClient();
  try {
    await gcClient.initialize();
    const userProfile = await gcClient.getUserProfile();
    logMessage(`user: ${userProfile.fullName}`);
  } catch (error) {
    logErrorMessage(error);
  }
})();
