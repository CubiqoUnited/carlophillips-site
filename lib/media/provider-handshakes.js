const supportedAccessModes = new Set([
  'official-api',
  'shopify-app',
  'browser-app',
  'enterprise-contact',
  'api-documentation-required',
]);

function statusFor(provider, environment) {
  if (provider.accessMode === 'official-api') {
    return environment[provider.credentialEnv]
      ? { status: 'credential-present', handshakeEstablished: false, nextAction: 'Run an approved read-only authentication probe before allowing a paid request.' }
      : { status: 'credential-required', handshakeEstablished: false, nextAction: `Provision ${provider.credentialEnv} server-side, then run an approved read-only authentication probe.` };
  }
  if (provider.accessMode === 'shopify-app') {
    return { status: 'shopify-app-review-required', handshakeEstablished: false, nextAction: 'Review the app scopes, plan and credit boundary in Shopify before installation or invocation.' };
  }
  if (provider.accessMode === 'browser-app') {
    return { status: 'human-session-only', handshakeEstablished: false, nextAction: 'Use approved browser access for a Draft-only job; no server API handshake is available.' };
  }
  if (provider.accessMode === 'enterprise-contact') {
    return { status: 'provider-contract-required', handshakeEstablished: false, nextAction: 'Obtain supported API access and pricing from the provider before integration.' };
  }
  return { status: 'api-documentation-required', handshakeEstablished: false, nextAction: 'Confirm the exact commercial service, official API documentation, authentication and pricing before integration.' };
}

export function deriveProviderHandshakes({ registry, environment = {} }) {
  if (registry?.schemaVersion !== 'cp.media-provider-handshakes.v1' || !Array.isArray(registry.providers)) {
    throw new Error('MEDIA_PROVIDER_HANDSHAKE_REGISTRY_INVALID');
  }
  const ids = new Set();
  return registry.providers.map(provider => {
    if (!provider.id || ids.has(provider.id) || !supportedAccessModes.has(provider.accessMode)) {
      throw new Error('MEDIA_PROVIDER_HANDSHAKE_REGISTRY_INVALID');
    }
    ids.add(provider.id);
    const decision = statusFor(provider, environment);
    return {
      id: provider.id,
      label: provider.label,
      lane: provider.lane,
      accessMode: provider.accessMode,
      officialReference: provider.officialReference,
      credentialName: provider.credentialEnv,
      ...decision,
      sideEffects: 'none',
      costIncurred: false,
    };
  });
}
