import type { GarminConnect } from 'garmin-connect';
import { UrlClass } from 'garmin-connect/dist/garmin/UrlClass';

export default async function updateLatestActivityName(client: GarminConnect, activityId: number, activityName: string) {
  const urlClass = new UrlClass();
  const payload = { activityId, activityName };
  return client.put(`${urlClass.ACTIVITY}${activityId}`, payload);
}
