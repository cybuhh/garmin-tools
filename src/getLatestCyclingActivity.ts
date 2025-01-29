import type { GarminConnect } from 'garmin-connect';
import { ActivitySubType, ActivityType } from 'garmin-connect/dist/garmin/types/activity';

export default async function getLatestCyclingActivity(client: GarminConnect) {
  const [activity] = await client.getActivities(0, 1, ActivityType.Cycling, 'virtual_ride' as unknown as ActivitySubType);
  return activity;
}
