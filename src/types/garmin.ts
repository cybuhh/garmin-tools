export interface GearItem {
  uuid: string;
  displayName: string;
}

export interface AddPhotoResponse {
  imageId: string;
  url: string;
  smallUrl: string;
  mediumUrl: string;
  expirationTimestamp: number;
  latitude: null;
  longitude: null;
  photoDate: null;
}

export interface UploadActivityResponse {
  detailedImportResult: {
    uploadId: number;
    uploadUuid: { uuid: string };
    owner: number;
    fileSize: number;
    processingTime: number;
    creationDate: string;
    ipAddress: string;
    fileName: string;
    report: null;
    successes: [];
    failures: [];
  };
}

/**
 * @example
 * {
    "gearPk": 39917352,
    "uuid": "4f5119d6a65d47b9bb235904f9ff927b",
    "userProfilePk": 95677586,
    "gearMakeName": "Other",
    "gearModelName": "Unknown Shoes",
    "gearTypeName": "Shoes",
    "gearStatusName": "active",
    "displayName": null,
    "customMakeModel": "Giro Sector",
    "imageNameLarge": null,
    "imageNameMedium": null,
    "imageNameSmall": null,
    "dateBegin": "2024-09-04T22:00:00.0",
    "dateEnd": null,
    "maximumMeters": 0,
    "notified": true,
    "createDate": "2024-09-05T18:09:05.0",
    "updateDate": "2025-10-03T13:07:12.0"
}
 */
export interface GearLinkResponse {
  gearPk: number;
  uuid: string;
  userProfilePk: number;
  gearMakeName: string;
  gearModelName: string;
  gearTypeName: string;
  gearStatusName: string;
  displayName: null | string;
  customMakeModel: string;
  imageNameLarge: null | string;
  imageNameMedium: null | string;
  imageNameSmall: null | string;
  dateBegin: string;
  dateEnd: null | string;
  maximumMeters: number;
  notified: boolean;
  createDate: string;
  updateDate: string;
}
