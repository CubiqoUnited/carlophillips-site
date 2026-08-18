import { describe, expect, it } from 'vitest';
import registry from '../config/media-generation-provider-handshakes.json';
import { deriveProviderHandshakes } from '../lib/media/provider-handshakes';

describe('Funnel 2 provider handshakes', () => {
  it('covers every requested provider without claiming an authenticated connection', () => {
    const rows = deriveProviderHandshakes({ registry, environment: {} });
    expect(rows.map(row => row.label)).toEqual([
      'Modelize', 'MODA', 'Sugata', 'TAYLA', 'Raspberry AI', 'ProductSpin AI', 'Instant 3D', 'Spacecheck', 'Runway',
    ]);
    expect(rows.every(row => row.handshakeEstablished === false)).toBe(true);
    expect(rows.every(row => row.sideEffects === 'none' && row.costIncurred === false)).toBe(true);
    expect(rows.find(row => row.id === 'runway')).toMatchObject({
      status: 'credential-required',
      credentialName: 'RUNWAYML_API_SECRET',
    });
  });

  it('treats a configured API secret as credential presence, not proof of authentication', () => {
    const rows = deriveProviderHandshakes({ registry, environment: { RUNWAYML_API_SECRET: 'server-only-placeholder' } });
    expect(rows.find(row => row.id === 'runway')).toMatchObject({
      status: 'credential-present',
      handshakeEstablished: false,
    });
    expect(JSON.stringify(rows)).not.toContain('server-only-placeholder');
  });

  it('fails closed for duplicate, malformed or unknown provider records', () => {
    const duplicate = structuredClone(registry);
    duplicate.providers.push(structuredClone(duplicate.providers[0]));
    expect(() => deriveProviderHandshakes({ registry: duplicate })).toThrow('MEDIA_PROVIDER_HANDSHAKE_REGISTRY_INVALID');
    expect(() => deriveProviderHandshakes({ registry: { schemaVersion: 'wrong', providers: [] } }))
      .toThrow('MEDIA_PROVIDER_HANDSHAKE_REGISTRY_INVALID');
  });
});
