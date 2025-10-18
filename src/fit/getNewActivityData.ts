import { DecodedMessages, Encoder, Profile } from '@garmin/fitsdk';

export default function getNewActivityData(messages: DecodedMessages) {
  const encoder = new Encoder();

  encoder.writeMesg({
    mesgNum: Profile.MesgNum.FILE_ID,
    ...messages.fileIdMesgs[0],
  });

  messages.deviceInfoMesgs.forEach((info) => {
    encoder.writeMesg({
      mesgNum: Profile.MesgNum.DEVICE_INFO,
      ...info,
    });
  });

  messages.eventMesgs.forEach((event) => {
    encoder.writeMesg({
      mesgNum: Profile.MesgNum.EVENT,
      ...event,
    });
  });
  messages.recordMesgs.forEach((record) => {
    encoder.writeMesg({
      mesgNum: Profile.MesgNum.RECORD,
      ...record,
    });
  });

  messages.lapMesgs.forEach((lap) => {
    encoder.writeMesg({
      mesgNum: Profile.MesgNum.LAP,
      ...lap,
    });
  });

  messages.sessionMesgs.forEach((session) => {
    encoder.writeMesg({
      mesgNum: Profile.MesgNum.SESSION,
      ...session,
    });
  });

  encoder.writeMesg({
    mesgNum: Profile.MesgNum.ACTIVITY,
    ...messages.activityMesgs[0],
  });

  return encoder.close();
}
