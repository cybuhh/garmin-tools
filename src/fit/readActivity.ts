import { Decoder, Stream, Message } from '@garmin/fitsdk';
import { readFile } from 'fs/promises';

export interface Device {
  serialNumber: number;
  manufacturer: string;
  product: number;
  garminProduct: string;
  softwareVersion: number;
}

export async function readActivityDevice(srcFilename: string) {
  const buffer = await readFile(srcFilename);
  const stream = Stream.fromByteArray(buffer);
  const decoder = new Decoder(stream);

  const onMesg = (_: number, message: Message) => {
    console.log(message);
  };

  const { errors } = decoder.read({
    mesgListener: onMesg,
  });

  if (errors && errors.length > 0) {
    const [error] = errors;
    throw new Error(`Create changed activity - ${error.message}`);
  }
}
