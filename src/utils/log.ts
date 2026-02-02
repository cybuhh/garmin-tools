import { EOL } from 'os';
const { inspect } = require('util');

const ICON_ERROR = '☠️';
const ICON_SUCCESS = '✅';
const ICON_VERBOSE = '👀';

export function logMessage(message: string): void {
  process.stderr.write(message + EOL);
}

export function logErrorMessage(message: string | Error | unknown): void {
  const prefix = `${ICON_ERROR} Error occurred.`;
  if (typeof message === 'string') {
    logMessage(`${prefix} ${message}`);
    return;
  }

  if (message instanceof Error) {
    logMessage(`${prefix} ${message.message}`);
    if (message.stack) {
      logMessage(message.stack);
    }
    return;
  }

  logMessage(`${prefix} ${inspect(message, { depth: null })}`);
}

export function logSuccessMessage(message: string): void {
  logMessage(`${ICON_SUCCESS} ${message}`);
}

export function logVerboseMessage(message: string): void {
  logMessage(`${ICON_VERBOSE} ${message}`);
}
