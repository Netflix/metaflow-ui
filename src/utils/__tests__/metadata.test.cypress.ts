import { metadataToRecord } from '../metadata';
import { createMetadata } from '../testhelper';

describe('Metadata utils', () => {
  it('metadataToRecord()', () => {
    expect(metadataToRecord([])).to.eql({});
    expect(metadataToRecord([createMetadata({ field_name: 'test', value: '123' })])).to.eql({ test: '123' });
    expect(
      metadataToRecord([
        createMetadata({ field_name: 'test', value: '123' }),
        createMetadata({ field_name: 'second', value: 'row' }),
        createMetadata({ field_name: 'third', value: 'row' }),
      ]),
    ).to.eql({ test: '123', second: 'row', third: 'row' });
  });
});
