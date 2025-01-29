import { HttpClient } from 'garmin-connect/dist/common/HttpClient';
import delay from './delay';

export default async function getUploadedActivityIdFromStatus(httpClient: HttpClient, statusLocation: string) {
  const result = await httpClient.client.get(statusLocation);

  if (!result.data) {
    await delay(500);
    return getUploadedActivityIdFromStatus(httpClient, statusLocation);
  }

  return result.data.detailedImportResult.successes[0].internalId;
}
