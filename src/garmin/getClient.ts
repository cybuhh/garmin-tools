import { GarminConnect } from 'garmin-connect';
import { loginWithToken, loginWithCredentials, exportTokenToFile } from './login';

export async function getClient() {
  const GCClient = new GarminConnect({ username: '', password: '' });

  try {
    if (!(await loginWithToken(GCClient))) {
      await loginWithCredentials(GCClient);
      exportTokenToFile(GCClient);
      process.exit(0);
    }
  } catch (error) {
    console.error("Can't login to garmin connect", error);
    process.exit(1);
  }
  return GCClient;
}
