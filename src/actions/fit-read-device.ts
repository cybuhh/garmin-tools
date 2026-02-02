import { argv } from 'process';
import { readActivityDevice } from 'features/fit/readActivity';

(async function main() {
  const [filename] = argv.slice(2);
  await readActivityDevice(filename);
})();
