import * as fs from 'fs/promises';
import * as path from 'path';
import * as strava from 'strava-v3';

// https://www.strava.com/oauth/authorize?client_id=...&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read
// https://www.npmjs.com/package/strava-v3
// https://developers.strava.com/docs/reference/#api-Routes-getRouteAsGPX
// https://www.strava.com/activities/.../export_original

const CWD = process.cwd();
const CONFIG_FILE = path.join(CWD, 'etc/strava_config.json');

interface StravaConfig {
  client_id: string;
  access_token: string;
  refresh_token: string;
  client_secret: string;
  redirect_uri: string;
}

class StatusCodeError extends Error {
  name: string;
  statusCode: number;

  constructor(statusCode: number) {
    super();
    this.name = 'StatusCodeError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, StatusCodeError.prototype);
  }
}

async function refreshToken(config: StravaConfig) {
  try {
    const { access_token, refresh_token } = await strava.oauth.refreshToken(config.refresh_token);
    await fs.writeFile(
      CONFIG_FILE,
      JSON.stringify({
        ...config,
        access_token,
        refresh_token,
      })
    );
    console.info('New token stored');
  } catch (e) {
    console.error('Token refresh error');
  }
}

export async function getLatestStravaActivity() {
  const config = JSON.parse((await fs.readFile(CONFIG_FILE)).toString()) as StravaConfig;

  strava.config(config);

  const stravaClient = new strava.client(config.access_token);

  try {
    const [activity] = await stravaClient.athlete.listActivities({ page: 1, per_page: 1 });
    return activity;
  } catch (e) {
    if (e instanceof Error && 'statusCode' in e && e.statusCode === 401) {
      console.info('refreshing token');
      await refreshToken(config);
      return;
    }
  }
}
