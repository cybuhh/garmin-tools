import { GarminConnect } from 'garmin-connect';
import * as readline from 'readline/promises';
import { URLSearchParams } from 'url';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { stdin as input, stdout as output } from 'process';
import { UrlClass } from 'garmin-connect/dist/garmin/UrlClass';
import { UploadFileTypeTypeValue, UploadFileType } from 'garmin-connect/dist/garmin/types';
import delay from '../common/delay';

const TOKENS_PATH = 'oauth_tokens';

export interface GearItem {
  uuid: string;
  displayName: string;
}

interface UploadActivityResponse {
  detailedImportResult: {
    uploadId: number;
    uploadUuid: { uuid: string };
    owner: number;
    fileSize: number;
    processingTime: number;
    creationDate: string;
    ipAddress: string;
    fileName: string;
    report: null;
    successes: [];
    failures: [];
  };
}

const urlClass = new UrlClass();
const supportedFormats = [UploadFileType.fit, UploadFileType.gpx, UploadFileType.tcx];

function isFormatSupported(detectedFormat: UploadFileType) {
  return !supportedFormats.includes(detectedFormat);
}

export class GarminConnectClient extends GarminConnect {
  constructor({ username = '', password = '' } = {}) {
    super({ username, password });
  }

  async initialize() {
    try {
      this.loadTokenByFile(TOKENS_PATH);
    } catch {
      this.regenerateToken();
    }
  }

  async regenerateToken() {
    try {
      await this.loginWithCredentials();
    } catch (error) {
      throw Error("Can't login to garmin connect. Invalid credentials");
    }
    this.exportTokenToFile(TOKENS_PATH);

    try {
      this.loadTokenByFile(TOKENS_PATH);
    } catch (e) {
      throw Error("Can't login to garmin connect. Failed to load token");
    }
  }

  async loginWithCredentials() {
    const rl = readline.createInterface({ input, output });

    const username = await rl.question('enter username: ');
    const password = await rl.question('enter password: ');
    return this.login(username, password);
  }

  async getGear({ profileId, activityId }: { profileId?: number; activityId?: number } = {}): Promise<ReadonlyArray<GearItem>> {
    const qs = new URLSearchParams();
    if (profileId) {
      qs.append('userProfilePk', String(profileId));
    }
    if (activityId) {
      qs.append('activityId', String(activityId));
    }
    const query = qs.toString();
    return this.get(`${urlClass.GC_API}/gear-service/gear/filterGear?${query}`);
  }

  async unlinkGear(uuid: string, activityId: string) {
    return this.put(`${urlClass.GC_API}/gear-service/gear/unlink/${uuid}/activity/${activityId}`, {});
  }

  async linkGear(uuid: string, activityId: string) {
    return this.put(`${urlClass.GC_API}/gear-service/gear/link/${uuid}/activity/${activityId}`, {});
  }

  async getUploadedActivityIdFromStatus(statusLocation: string): Promise<string> {
    const result = (await this.client.get(statusLocation)) as { detailedImportResult: { successes: [{ internalId: string }] } };

    if (!result.detailedImportResult) {
      await delay(500);
      return this.getUploadedActivityIdFromStatus(statusLocation);
    }

    return result.detailedImportResult.successes[0].internalId;
  }

  async uploadActivity(filePath: string, format: UploadFileTypeTypeValue = UploadFileType.fit): Promise<string> {
    const detectedFormat = (format || path.extname(filePath))?.toLowerCase() as UploadFileType;
    if (isFormatSupported(detectedFormat)) {
      throw new Error('Upload activity - Invalid format: ' + format);
    }

    const fileBuffer = (await readFile(filePath)) as unknown as BlobPart;
    const blob = new Blob([fileBuffer]);

    const form = new FormData();
    form.append('userfile', blob);

    const { headers } = await this.client.client.post(urlClass.UPLOAD + '.' + format, form, {
      headers: {
        'Content-Type': 'multipart/form-data;',
      },
    });
    if (!headers.location) {
      throw new Error(`Upload activty - ${headers['upload-message-content']}`);
    }
    return this.getUploadedActivityIdFromStatus(headers.location);
  }

  async updateLatestActivityName(activityId: string, activityName: string) {
    const payload = { activityId, activityName };
    return this.client.put(`${urlClass.ACTIVITY}${activityId}`, payload);
  }
}
