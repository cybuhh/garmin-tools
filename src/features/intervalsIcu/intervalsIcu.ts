import { writeFile } from 'fs/promises';
import { Activity } from '@intervals-icu/js-data-model';
import { IntervalsIcuConfig } from 'types/config';

const API_BASE_URL = 'https://intervals.icu/api/v1';

export function intervalsIcu({ apiKey, athleteId = '0' }: IntervalsIcuConfig) {
  const headers = {
    Authorization: 'Basic ' + btoa(`API_KEY:${apiKey}`),
  };

  /**
   *
   * @url https://intervals.icu/api-docs.html#get-/api/v1/activity/-id-
   * @param activityId
   */
  async function getActivityDetails(activityId: string) {
    const url = `${API_BASE_URL}/activity/${activityId}`;

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const activity = (await response.json()) as Activity;

    return {
      id: activity.id,
      name: activity.name,
      filename: activity.external_id,
      date: activity.start_date,
    };
  }

  /**
   * @url https://intervals.icu/api-docs.html#get-/api/v1/activity/-id-/file
   * @param activityId
   * @param filename
   * @returns
   */
  async function downloadOriginalActivityFile(activityId: string, filename: string) {
    const url = `${API_BASE_URL}/activity/${activityId}/file`;

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

    const url = `${API_BASE_URL}/athlete/${athleteId}/activities?${query.toString()}`;

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error fetching activities. HTTP status ${response.status}`);
    }

    return response.json() as Promise<ReadonlyArray<Activity>>;
  }

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

  async function deleteActivity(id: string) {
    const url = `${API_BASE_URL}/activity/${id}`;
    const response = await fetch(url, {
      headers,
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error deleting activity ${id}. HTTP status ${response.status}`);
    }

    return response.json() as Promise<ReadonlyArray<Activity>>;
  }

  return {
    getLatestActivity,
    downloadOriginalActivityFile,
    getActivityDetails,
    deleteActivity,
  };
}
