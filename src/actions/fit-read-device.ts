import { readActivityDevice } from 'features/fit/readActivity';

(async function main() {
  const [filename] = process.argv.slice(2);
  await readActivityDevice(filename);
})();
