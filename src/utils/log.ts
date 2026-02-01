import { EOL } from 'os';

export function logErrorMessage(message: string | unknown): void {
  if (typeof message === 'string') {
    process.stderr.write('☠️ Error occured. ' + message + EOL);
  } else {
    console.error(message);
  }
}

export function logSuccessMessage(message: string): void {
  process.stderr.write('✅' + message + EOL);
}

export function logVerboseMessage(message: string): void {
  process.stderr.write('👀' + message + EOL);
}

export function logMessage(message: string): void {
  process.stderr.write(message + EOL);
}
