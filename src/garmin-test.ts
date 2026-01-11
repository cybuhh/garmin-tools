import { GarminConnectClient } from 'garmin/client';

(async function main() {
  const gcClient = new GarminConnectClient();
  try {
    await gcClient.initialize();
    const userProfile = await gcClient.getUserProfile();
    console.log(`user: ${userProfile.fullName}`);
  } catch (error) {
    console.error(error);
  }
})();
