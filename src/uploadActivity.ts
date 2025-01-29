import { HttpClient } from 'garmin-connect/dist/common/HttpClient';
import { UploadFileTypeTypeValue, UploadFileType } from 'garmin-connect/dist/garmin/types';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { UrlClass } from 'garmin-connect/dist/garmin/UrlClass';

const urlClass = new UrlClass();
const supportedFormats = [UploadFileType.fit, UploadFileType.gpx, UploadFileType.tcx];

function isFormatSupported(detectedFormat: UploadFileType) {
  return !supportedFormats.includes(detectedFormat);
}

export default async function uploadActivity(httpClient: HttpClient, filePath: string, format: UploadFileTypeTypeValue = 'fit'): Promise<string> {
  const detectedFormat = (format || path.extname(filePath))?.toLowerCase() as UploadFileType;
  if (isFormatSupported(detectedFormat)) {
    throw new Error('uploadActivity - Invalid format: ' + format);
  }

  const fileBuffer = await readFile(filePath);
  const blob = new Blob([fileBuffer]);

  const form = new FormData();
  form.append('userfile', blob);

  const { headers } = await httpClient.client.post(urlClass.UPLOAD + '.' + format, form, {
    headers: {
      'Content-Type': 'multipart/form-data;',
    },
  });

  return headers.location;
}
