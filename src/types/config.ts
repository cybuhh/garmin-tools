interface GarminPresetItem {
  uuid: string;
  displayName: string;
}

export interface GarminPreset {
  [key: string]: ReadonlyArray<GarminPresetItem>;
}

export interface IntervalsIcuConfig {
  apiKey: string;
  athleteId?: string;
}

export interface GarminDevice {
  serialNumber: number;
  manufacturer: string;
  product: string;
  garminProduct: string;
  softwareVersion: number;
}
