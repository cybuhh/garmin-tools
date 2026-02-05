import { exit } from 'process';
import { logErrorMessage } from 'utils/log';

export function initErrorHandler() {
  process.on('uncaughtException', (reason) => {
    logErrorMessage(reason);
    exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logErrorMessage(reason);
    exit(1);
  });
}
