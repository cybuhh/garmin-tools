import { join } from 'path';
import { readFile, unlink, writeFile } from 'fs/promises';
import { GarminConnectClient } from 'garmin/client';
import { Decoder, Stream } from '@garmin/fitsdk';
import { ExportFileType, UploadFileType } from 'garmin-connect/dist/garmin/types';
import { ActivitySubType, ActivityType } from 'garmin-connect/dist/garmin/types/activity';
import getPatchedActivity from 'fit/getNewActivityData';
import changeDevice from 'fit/changeDevice';
import extractActivityFile from 'fit/extractActivityFile';
import * as device from '../etc/device.json';

const CWD = process.cwd();

(async function main() {
  const client = new GarminConnectClient();
  await client.initialize();

  const [activity] = await client.getActivities(0, 1, ActivityType.Cycling, 'virtual_ride' as unknown as ActivitySubType);
  const { activityId, activityName } = activity;

  await client.downloadOriginalActivityData(
    {
      activityId,
    },
    CWD,
    ExportFileType.zip
  );

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

  const uploadedFileStatusLocation = await client.uploadActivity(dstFilename, UploadFileType.fit);
  const uploadedActivityId = await client.getUploadedActivityIdFromStatus(uploadedFileStatusLocation);

  await client.updateLatestActivityName(uploadedActivityId, activityName);
  await client.deleteActivity({ activityId });
})();
