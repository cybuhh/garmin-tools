declare module '@garmin/fitsdk' {
  export interface Message {
    timestamp: Date;
    serialNumber?: number;
    manufacturer: string;
    product: number | string;
    softwareVersion: number;
    deviceIndex: number | 'creator';
    sourceType: 'local' | 'antplus';
    garminProduct: number | 'hrmProPlus';
    cumOperatingTime?: number;
    deviceType?: number;
    localDeviceType?: 'barometer' | 'bikeCadence' | 'heartRate' | 'gps';
    antNetwork?: 'antplus';
    antplusDeviceType?: 'bikeSpeed' | 'heartRate' | 'bikeRadar';
    batteryVoltage?: number;
    hardwareVersion?: number;
    batteryStatus?: 'ok' | 'good';
  }

  export interface DecodedMessages {
    fileIdMesgs: ReadonlyArray<unknown>;
    deviceInfoMesgs: ReadonlyArray<unknown>;
    eventMesgs: ReadonlyArray<unknown>;
    recordMesgs: ReadonlyArray<unknown>;
    lapMesgs: ReadonlyArray<unknown>;
    sessionMesgs: ReadonlyArray<unknown>;
    activityMesgs: ReadonlyArray<unknown>;
  }

  type onReadMsgHandler = () => void;

  export class Decoder {
    constructor(stream: Stream);
    public static isFIT(stream: Stream): boolean;
    public read({ mesgListener: onReadMsgHandler }): { messages: DecodedMessages; errors: ReadonlyArray<Error> };
  }

  export class Encoder {
    constructor();
    public writeMesg(msg: Message): void;
    public close(): Buffer<ArrayBufferLike>;
  }

  export class Stream {
    constructor();
    public static fromByteArray(stream: Buffer<ArrayBufferLike>): Stream;
  }

  export class Profile {
    public static types: {
      mesgNum: {
        [key: string]: string;
      };
    };
    public static MesgNum: {
      [key: string]: string;
    };
  }

  export class Utils {
    constructor();
  }
}

interface UploadActivityResult {
  detailedImportResult: {
    uploadId: number;
    uploadUuid: {
      uuid: string;
    };
    owner: number;
    fileSize: number;
    processingTime: number;
    creationDate: Date;
    ipAddress: null;
    fileName: string;
    report: null;
    successes: [];
    failures: [];
  };
}
