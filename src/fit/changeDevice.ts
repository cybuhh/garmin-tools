import { DecodedMessages, Message } from '@garmin/fitsdk';

const changeFileIdDeviceId = (device: Device) => (item: Message) => {
  if (item.manufacturer !== 'zwift') {
    return item;
  }

  const { serialNumber, manufacturer, product, garminProduct } = device;

  return {
    ...item,
    serialNumber,
    manufacturer,
    product,
    garminProduct,
  };
};

const changeInfoDeviceId = (device: Device) => (item: Message) => {
  if (item.manufacturer !== 'zwift') {
    return item;
  }

  const { serialNumber, manufacturer, product, softwareVersion, garminProduct } = device;

  return {
    ...item,
    serialNumber,
    manufacturer,
    product,
    softwareVersion,
    garminProduct,
    sourceType: 'local',
  };
};

interface Device {
  serialNumber: number;
  manufacturer: string;
  product: number;
  garminProduct: string;
  softwareVersion: number;
}

export default function changeDevice(messages: DecodedMessages, device: Device) {
  return {
    ...messages,
    fileIdMesgs: messages.fileIdMesgs.map(changeFileIdDeviceId(device)),
    deviceInfoMesgs: messages.deviceInfoMesgs.map(changeInfoDeviceId(device)),
  } as DecodedMessages;
}
