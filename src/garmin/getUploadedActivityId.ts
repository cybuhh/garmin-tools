import { GarminConnect } from 'garmin-connect';
import { ActivitySubType, ActivityType } from 'garmin-connect/dist/garmin/types/activity';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function getUploadedActivityId(client: GarminConnect, activityId: number, startTimeGMT: string): Promise<number> {
  const activities = await client.getActivities(0, 2, ActivityType.Cycling, 'virtual_ride' as unknown as ActivitySubType);
  const result = activities.filter((activity) => activity.activityId !== activityId).filter((activity) => activity.startTimeGMT === startTimeGMT);

  if (result.length > 0) {
    return result[0].activityId;
  }

  await delay(500);

  return getUploadedActivityId(client, activityId, startTimeGMT);
}
