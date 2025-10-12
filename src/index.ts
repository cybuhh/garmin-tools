import { GarminConnect } from 'garmin-connect';
import { ExportFileType, UploadFileType } from 'garmin-connect/dist/garmin/types';
import { Decoder, Stream } from '@garmin/fitsdk';
import { readFile, unlink, writeFile } from 'fs/promises';
import getPatchedActivity from './garmin/getNewActivityData';
import changeDevice from './garmin/changeDevice';
import extractActivityFile from './garmin/extractActivityFile';
import { join } from 'path';
import getLatestCyclingActivity from './garmin/getLatestCyclingActivity';
import updateLatestActivityName from './garmin/updateLatestActivityName';
import getUploadedActivityIdFromStatus from './garmin/getUploadedActivityIdFromStatus';
import uploadActivity from './garmin/uploadActivity';
import { getClient } from './garmin/getClient';

const CWD = process.cwd();
const device = require(join(CWD, 'etc/device.json'));

async function downloadLatestCycling(client: GarminConnect, activityId: number, directory: string) {
  await client.downloadOriginalActivityData(
    {
      activityId,
    },
    directory,
    ExportFileType.zip
  );
}

(async function main() {
  const GCClient = await getClient();

  const { activityId, activityName } = await getLatestCyclingActivity(GCClient);

  await downloadLatestCycling(GCClient, activityId, CWD);

  const srcFilename = await extractActivityFile(activityId, CWD);

  if (!srcFilename) {
    return;
  }

  const buffer = await readFile(srcFilename);
  const stream = Stream.fromByteArray(buffer);

  const decoder = new Decoder(stream);
  const { messages } = decoder.read();

  const changedMessages = changeDevice(messages, device);

  const dstFilename = join(CWD, `${activityId}.fit`);
  await writeFile(dstFilename, getPatchedActivity(changedMessages), { flag: 'w+' });

  await unlink(srcFilename);

  const uploadedFileStatusLocation = await uploadActivity(GCClient.client, dstFilename, UploadFileType.fit);
  const uploadedActivityId = await getUploadedActivityIdFromStatus(GCClient.client, uploadedFileStatusLocation);

  await updateLatestActivityName(GCClient, uploadedActivityId, activityName);
  await GCClient.deleteActivity({ activityId });
})();
