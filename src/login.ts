import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import type { GarminConnect } from 'garmin-connect';

const TOKENS_PATH = 'oauth_tokens';

export async function loginWithCredentials(client: GarminConnect) {
  const rl = readline.createInterface({ input, output });

  const username = await rl.question('enter username: ');
  const password = await rl.question('enter password: ');
  return client.login(username, password);
}

export async function loginWithToken(client: GarminConnect) {
  try {
    client.loadTokenByFile(TOKENS_PATH);
    return true;
  } catch {
    return false;
  }
}

export function exportTokenToFile(client: GarminConnect) {
  return client.exportTokenToFile(TOKENS_PATH);
}
