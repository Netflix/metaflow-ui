import {
  isVersionEqualOrHigher,
  MESSAGE_NAME,
  PluginCommuncationsAPI,
  PluginManifest,
  pluginPath,
} from '../PluginManager';

function createPluginManifest(d: Partial<PluginManifest> = {}): PluginManifest {
  return {
    name: 'Plugin name',
    repository: null,
    ref: null,
    parameters: {},
    config: {
      name: 'Plugin name',
      version: '1.0.0',
      entrypoint: 'index.html',
    },
    identifier: 'id',
    files: ['index.html'],
    ...d,
  };
}

describe('Plugins utils', () => {
  it('isVersionEqualOrHigher', () => {
    // Equals
    expect(isVersionEqualOrHigher('0.0.1', '0.0.1')).toBe(true);
    expect(isVersionEqualOrHigher('0.1.0', '0.1.0')).toBe(true);
    expect(isVersionEqualOrHigher('1.0.0', '1.0.0')).toBe(true);

    // Is smaller
    expect(isVersionEqualOrHigher('0.0.0', '0.0.1')).toBe(false);
    expect(isVersionEqualOrHigher('0.0.1', '0.1.0')).toBe(false);
    expect(isVersionEqualOrHigher('0.1.0', '1.0.0')).toBe(false);

    expect(isVersionEqualOrHigher('0.1.0', '0.2.0')).toBe(false);
    expect(isVersionEqualOrHigher('0.2.3', '1.0.0')).toBe(false);
    expect(isVersionEqualOrHigher('0.0.3', '1.0.0')).toBe(false);
    expect(isVersionEqualOrHigher('125.1315.12315', '125.12316.1')).toBe(false);

    // Is bigger
    expect(isVersionEqualOrHigher('0.0.2', '0.0.1')).toBe(true);
    expect(isVersionEqualOrHigher('0.2.0', '0.1.0')).toBe(true);
    expect(isVersionEqualOrHigher('2.0.0', '1.0.0')).toBe(true);

    expect(isVersionEqualOrHigher('1.2.3', '1.0.0')).toBe(true);
    expect(isVersionEqualOrHigher('2.2.3', '2.1.1')).toBe(true);
    expect(isVersionEqualOrHigher('3.0.1', '2.1.1')).toBe(true);
    expect(isVersionEqualOrHigher('125.1315.12315', '2.1.1')).toBe(true);
  });

  it('pluginPath', () => {
    expect(pluginPath(createPluginManifest())).toBe('http://localhost/api/plugin/Plugin name/index.html');
    expect(
      pluginPath(
        createPluginManifest({
          name: 'another_name',
          config: { name: 'another_name', entrypoint: 'plugin.html', version: '0' },
        }),
      ),
    ).toBe('http://localhost/api/plugin/another_name/plugin.html');
  });

  it('PluginCommuncationsAPI.isPluginMessage', () => {
    // All keys from constant should be seen as valid
    for (const key in MESSAGE_NAME) {
      expect(
        PluginCommuncationsAPI.isPluginMessage(
          {
            data: {
              type: (MESSAGE_NAME as any)[key],
              name: 'test',
            },
          } as MessageEvent,
          'test',
        ),
      ).toBe(true);
    }
    // Wrong type fails
    expect(
      PluginCommuncationsAPI.isPluginMessage(
        {
          data: {
            type: 'wrong name',
            name: 'test',
          },
        } as MessageEvent,
        'test',
      ),
    ).toBe(false);
    // Mismatch on names fails
    expect(
      PluginCommuncationsAPI.isPluginMessage(
        {
          data: {
            type: MESSAGE_NAME.HEIGHT_CHECK,
            name: 'no match',
          },
        } as MessageEvent,
        'test',
      ),
    ).toBe(false);
  });

  it('PluginCommuncationsAPI.isRegisterMessage', () => {
    // Messages with too little properties
    expect(PluginCommuncationsAPI.isRegisterMessage({ data: {} } as MessageEvent)).toBe(false);
    expect(PluginCommuncationsAPI.isRegisterMessage({ data: { type: 'PluginRegisterEvent' } } as MessageEvent)).toBe(
      false,
    );
    expect(
      PluginCommuncationsAPI.isRegisterMessage({ data: { type: 'PluginRegisterEvent', name: 'test' } } as MessageEvent),
    ).toBe(false);
    expect(
      PluginCommuncationsAPI.isRegisterMessage({
        data: { type: 'PluginRegisterEvent', name: 'test', slot: 'test' },
      } as MessageEvent),
    ).toBe(false);

    // Correct message
    const correctMessage = {
      data: { type: 'PluginRegisterEvent', name: 'test', slot: 'test', version: { api: '1.0.0' } },
    };
    expect(PluginCommuncationsAPI.isRegisterMessage(correctMessage as MessageEvent)).toEqual(correctMessage.data);
    // Messages with wrong data types
    expect(
      PluginCommuncationsAPI.isRegisterMessage({
        data: { ...correctMessage.data, version: { api: 13 } },
      } as MessageEvent),
    ).toBe(false);
    expect(
      PluginCommuncationsAPI.isRegisterMessage({
        data: { ...correctMessage.data, name: 123 },
      } as MessageEvent),
    ).toBe(false);
    expect(
      PluginCommuncationsAPI.isRegisterMessage({
        data: { ...correctMessage.data, slot: 123 },
      } as MessageEvent),
    ).toBe(false);
  });

  it('PluginCommuncationsAPI.isUpdatePluginMessage', () => {
    expect(PluginCommuncationsAPI.isUpdatePluginMessage(null)).toBe(false);
    expect(PluginCommuncationsAPI.isUpdatePluginMessage(123)).toBe(false);
    expect(PluginCommuncationsAPI.isUpdatePluginMessage('null')).toBe(false);
    expect(PluginCommuncationsAPI.isUpdatePluginMessage([null])).toBe(false);
    expect(PluginCommuncationsAPI.isUpdatePluginMessage({})).toBe(false);

    expect(PluginCommuncationsAPI.isUpdatePluginMessage({ name: 'test', slot: 'test', visible: true })).toBe(true);
    expect(PluginCommuncationsAPI.isUpdatePluginMessage({ name: 'test', slot: 'test', visible: 'true' })).toBe(false);
    expect(PluginCommuncationsAPI.isUpdatePluginMessage({ name: 'test', visible: true })).toBe(false);
  });
});
