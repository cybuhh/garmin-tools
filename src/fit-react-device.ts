import { readActivityDevice } from 'fit/readActivity';

(async function main() {
  await readActivityDevice('./activity.fit');
})();
