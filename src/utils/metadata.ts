import { Metadata } from '@/types';

export function metadataToRecord(data: Metadata[]): Record<string, string> {
  return data.reduce((obj, metadata) => {
    return { ...obj, [metadata.field_name]: metadata.value };
  }, {});
}
