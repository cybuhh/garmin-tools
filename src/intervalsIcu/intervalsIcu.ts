import { writeFile } from 'fs/promises';
import { Activity } from '@intervals-icu/js-data-model';

export function intervalsIcu({ apiKey, athleteId = '0' }: { apiKey: string; athleteId?: string }) {
  const headers = {
    Authorization: 'Basic ' + btoa(`API_KEY:${apiKey}`),
  };

  /**
   *
   * @url https://intervals.icu/api-docs.html#get-/api/v1/activity/-id-
   * @param activityId
   */
  async function getActivityDetails(activityId: string) {
    const url = `https://intervals.icu/api/v1/activity/${activityId}`;

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const detail = await response.json();
    console.log(detail);
  }

  /**
   * @url https://intervals.icu/api-docs.html#get-/api/v1/activity/-id-/file
   * @param activityId
   * @param filename
   * @returns
   */
  async function downloadOriginalActivityFile(activityId: string, filename: string) {
    const url = `https://intervals.icu/api/v1/activity/${activityId}/file`;

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    return writeFile(filename, Buffer.from(buffer));
  }

  /**
   *
   * @url https://intervals.icu/api-docs.html#get-/api/v1/athlete/-id-/activities
   */
  async function getActivities(oldest: string, limit = 1) {
    const query = new URLSearchParams({
      fields: 'id,name,external_id,start_date,type',
      oldest,
      limit: String(limit),
    });

    const url = `https://intervals.icu/api/v1/athlete/${athleteId}/activities?${query.toString()}`;

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error fetching activities. HTTP status ${response.status}`);
    }

    return response.json() as Promise<ReadonlyArray<Activity>>;
  }

  return {
    getLatestActivity,
    downloadOriginalActivityFile,
    getActivityDetails,
  };

  async function getLatestActivity(type = 'VirtualRide') {
    const now = new Date();
    now.setDate(now.getDate() - 7);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const oldest = `${year}-${month}-${day}`;

    const activities = await getActivities(oldest, 10);
    const activity = activities.find((activity) => activity.type === type);

    if (!activity || !activity.id || !activity.name || !activity.external_id || !activity.start_date) {
      throw new Error('Error fetching latest activity');
    }

    return {
      id: activity.id,
      name: activity.name,
      filename: activity.external_id,
      date: activity.start_date,
    };
  }
}
