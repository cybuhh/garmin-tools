import { Decoder, Encoder, Stream, Message } from '@garmin/fitsdk';
import { readFile, writeFile } from 'fs/promises';

export interface Device {
  serialNumber: number;
  manufacturer: string;
  product: number;
  garminProduct: string;
  softwareVersion: number;
}

export async function createChangedActivity(srcFilename: string, dstFilename: string, device: Device) {
  const buffer = await readFile(srcFilename);
  const stream = Stream.fromByteArray(buffer);
  const decoder = new Decoder(stream);
  const encoder = new Encoder();

  const changeDevice = (message: Message) =>
    Object.entries(message).reduce((acc, [k, v]) => ({
      ...(acc || {}),
      [k]: k in device ? (device as any)[k] : v,
    }));

  const onMesg = (messageNumber: number, message: Message) => {
    const newMessage = {
      mesgNum: messageNumber,
      ...changeDevice(message),
    } as unknown as Message;

    /** fix invlaid fields */
    if ('developerFields' in newMessage) {
      newMessage.developerFields = null;
    }

    try {
      encoder.writeMesg(newMessage);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`${err.message}. ${messageNumber}. ${JSON.stringify(newMessage)}`);
      }
      throw err;
    }
  };

  const { errors } = decoder.read({
    mesgListener: onMesg,
  });

  if (errors && errors.length > 0) {
    const [error] = errors;
    throw new Error(`Create changed activity - ${error.message}`);
  }

  const encodedMessages = encoder.close();

  return writeFile(dstFilename, encodedMessages, { flag: 'w+' });
}
