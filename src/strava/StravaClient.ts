import * as fs from 'fs/promises';
import { EOL } from 'os';
import * as strava from 'strava-v3';
import type { client, DetailedActivityResponse } from 'strava-v3';

interface StravaConfig {
  client_id: string;
  access_token: string;
  refresh_token: string;
  client_secret: string;
  redirect_uri: string;
}

interface ActivityPhotos {
  photos: {
    primary: {
      id: null;
      unique_id: string;
      urls: {
        [key: string]: string;
      };
      source: number;
    };
    use_primary_photo: boolean;
    count: number;
  };
}

/**
 * @url https://www.strava.com/oauth/authorize?client_id=...&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read
 * @url https://developers.strava.com/docs/reference/#api-Routes-getRouteAsGPX
 * @url https://www.strava.com/activities/__ACTIVITY_ID__/export_original
 */
export class StravaClient {
  private client: client;
  private config: StravaConfig;
  private configPath: string;

  constructor(configPath: string, config: StravaConfig) {
    strava.config(config);
    this.configPath = configPath;
    this.config = config;
    this.client = new strava.client(config.access_token);
  }

  async tokenRefresh() {
    try {
      const { refresh_token } = this.config;
      const newToken = await strava.oauth.refreshToken(refresh_token);

      const newConfig = {
        ...this.config,
        access_token: newToken.access_token,
        refresh_token: newToken.refresh_token,
      };

      await fs.writeFile(this.configPath, JSON.stringify(newConfig));
      process.stdout.write('New token stored' + EOL);
    } catch (e) {
      process.stdout.write('Token refresh error' + EOL);
      if (e instanceof Error) {
        process.stdout.write(e.message + EOL);
      } else {
        process.stdout.write(JSON.stringify(e) + EOL);
      }
    }
  }

  async getLatestActivity(): Promise<DetailedActivityResponse> {
    const [activity] = await this.client.athlete.listActivities({ page: 1, per_page: 1 });
    return activity;
  }

  async getActivityPhoto(id: string) {
    const activity = (await this.client.activities.get({ id })) as DetailedActivityResponse & ActivityPhotos;
    const { urls } = activity.photos.primary;
    const photoUrlKey = Object.keys(urls).map(Number).sort().slice(-1)[0];
    return urls[String(photoUrlKey)];
  }
}
