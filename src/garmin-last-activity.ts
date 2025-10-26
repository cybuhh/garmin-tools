import { GarminConnectClient } from 'garmin/client';
import { EOL } from 'os';

(async function main() {
  const gcClient = new GarminConnectClient();

  try {
    await gcClient.initialize();
    const activities = await gcClient.getActivities(0, 1);
    process.stdout.write([JSON.stringify(activities[0])] + EOL);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    process.stderr.write('☠️ Error occured. ' + errorMessage + EOL);
    process.exit(1);
  }
})();
