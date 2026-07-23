import registryDocument from '../../config/capability-registry.json';

export function getCapabilityRegistry() {
  const registry = structuredClone(registryDocument);
  const errors = validateCapabilityRegistry(registry);
  if (errors.length) throw new Error(`Capability registry invalid: ${errors.join('; ')}`);
  return registry;
}

export function validateCapabilityRegistry(registry) {
  const errors = [];
  const names = new Set();

  for (const capability of registry.capabilities || []) {
    if (names.has(capability.capability)) {
      errors.push(`duplicate capability ${capability.capability}`);
    }
    names.add(capability.capability);

    const verified = ['local_verified', 'read_only_verified', 'write_test_verified']
      .includes(capability.accessState);
    if (verified && !capability.selectedAdapter) {
      errors.push(`${capability.capability} has verified access without an adapter`);
    }
    if (verified && capability.callableSurface === 'unverified') {
      errors.push(`${capability.capability} has verified access with an unverified surface`);
    }
    if (!verified && !capability.blocker) {
      errors.push(`${capability.capability} lacks an exact blocker`);
    }
  }

  return errors;
}

export function discoverCapability(registry, capabilityName, requiredOperation) {
  const capability = registry.capabilities.find(item => item.capability === capabilityName);
  if (!capability) {
    return {
      status: 'unavailable',
      capability: capabilityName,
      adapter: null,
      callableSurface: 'unavailable',
      reason: 'CAPABILITY_NOT_REGISTERED',
      blocker: {
        code: 'CAPABILITY_NOT_REGISTERED',
        humanAction: `Classify the ${capabilityName} capability before use.`,
        resumePoint: `Add an evidence-backed ${capabilityName} registry entry and rerun discovery.`,
      },
    };
  }

  const operationAllowed = capability.allowedOperations.includes(requiredOperation);
  const accessVerified = ['local_verified', 'read_only_verified', 'write_test_verified']
    .includes(capability.accessState);
  if (capability.selectedAdapter && accessVerified && operationAllowed) {
    return {
      status: 'ready',
      capability: capabilityName,
      adapter: capability.selectedAdapter,
      callableSurface: capability.callableSurface,
      reason: null,
      blocker: null,
    };
  }

  return {
    status: capability.accessState === 'unavailable' ? 'unavailable' : 'human_required',
    capability: capabilityName,
    adapter: capability.selectedAdapter,
    callableSurface: capability.callableSurface,
    reason: capability.blocker?.code || 'CAPABILITY_OPERATION_UNVERIFIED',
    blocker: capability.blocker || {
      code: 'CAPABILITY_OPERATION_UNVERIFIED',
      humanAction: `Verify ${requiredOperation} access for ${capabilityName}.`,
      resumePoint: `Record the callable surface and add ${requiredOperation} only after evidence passes.`,
    },
  };
}
