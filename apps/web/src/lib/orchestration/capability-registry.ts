import registryDocument from '../../../../../config/capability-registry.json';
import type {
  CapabilityDecision,
  CapabilityRegistry,
} from '../commerce/runtime-types';

export function getCapabilityRegistry(): CapabilityRegistry {
  const registry = structuredClone(registryDocument) as CapabilityRegistry;
  const errors = validateCapabilityRegistry(registry);
  if (errors.length)
    throw new Error(`Capability registry invalid: ${errors.join('; ')}`);
  return registry;
}

export function validateCapabilityRegistry(
  registry: CapabilityRegistry
): string[] {
  const errors: string[] = [];
  const names = new Set<string>();

  for (const capability of registry.capabilities || []) {
    if (names.has(capability.capability)) {
      errors.push(`duplicate capability ${capability.capability}`);
    }
    names.add(capability.capability);

    const verified = [
      'local_verified',
      'read_only_verified',
      'write_test_verified',
      'write_verified',
    ].includes(capability.accessState);
    if (verified && !capability.selectedAdapter) {
      errors.push(
        `${capability.capability} has verified access without an adapter`
      );
    }
    if (verified && capability.callableSurface === 'unverified') {
      errors.push(
        `${capability.capability} has verified access with an unverified surface`
      );
    }
    if (
      verified &&
      capability.callableSurface !== 'local' &&
      !capability.evidenceRef
    ) {
      errors.push(
        `${capability.capability} has verified external access without evidenceRef`
      );
    }
    if (capability.accessState === 'write_test_verified') {
      if (
        !capability.allowedOperations.length ||
        capability.allowedOperations.some(
          (operation) => !operation.endsWith('-test')
        )
      ) {
        errors.push(
          `${capability.capability} exposes a write test as an operational write`
        );
      }
      if (!capability.blocker) {
        errors.push(
          `${capability.capability} lacks an operational blocker for write-test evidence`
        );
      }
    }
    if (!verified && !capability.blocker) {
      errors.push(`${capability.capability} lacks an exact blocker`);
    }
  }

  return errors;
}

export function discoverCapability(
  registry: CapabilityRegistry,
  capabilityName: string,
  requiredOperation: string
): CapabilityDecision {
  const capability = registry.capabilities.find(
    (item) => item.capability === capabilityName
  );
  if (!capability) {
    return {
      status: 'unavailable',
      capability: capabilityName,
      adapter: null,
      callableSurface: 'unavailable',
      evidenceRef: null,
      reason: 'CAPABILITY_NOT_REGISTERED',
      blocker: {
        code: 'CAPABILITY_NOT_REGISTERED',
        humanAction: `Classify the ${capabilityName} capability before use.`,
        resumePoint: `Add an evidence-backed ${capabilityName} registry entry and rerun discovery.`,
      },
    };
  }

  const operationAllowed =
    capability.allowedOperations.includes(requiredOperation);
  const accessVerified = [
    'local_verified',
    'read_only_verified',
    'write_test_verified',
    'write_verified',
  ].includes(capability.accessState);
  if (
    capability.selectedAdapter &&
    capability.accessState === 'write_test_verified' &&
    operationAllowed
  ) {
    return {
      status: 'evidence_only',
      capability: capabilityName,
      adapter: capability.selectedAdapter,
      callableSurface: capability.callableSurface,
      evidenceRef: capability.evidenceRef || null,
      technicalStatus: 'verified_test',
      operationalAuthority: 'blocked',
      reason: capability.blocker?.code || 'WRITE_TEST_EVIDENCE_ONLY',
      blocker: capability.blocker || null,
    };
  }
  if (capability.selectedAdapter && accessVerified && operationAllowed) {
    return {
      status: 'ready',
      capability: capabilityName,
      adapter: capability.selectedAdapter,
      callableSurface: capability.callableSurface,
      evidenceRef: capability.evidenceRef || null,
      technicalStatus: 'verified',
      operationalAuthority:
        capability.accessState === 'local_verified'
          ? 'local_only'
          : 'observation_only',
      reason: null,
      blocker: null,
    };
  }

  return {
    status:
      capability.accessState === 'unavailable'
        ? 'unavailable'
        : 'human_required',
    capability: capabilityName,
    adapter: capability.selectedAdapter,
    callableSurface: capability.callableSurface,
    evidenceRef: capability.evidenceRef || null,
    technicalStatus: accessVerified ? 'verified' : 'unverified',
    operationalAuthority: 'blocked',
    reason: capability.blocker?.code || 'CAPABILITY_OPERATION_UNVERIFIED',
    blocker: capability.blocker || {
      code: 'CAPABILITY_OPERATION_UNVERIFIED',
      humanAction: `Verify ${requiredOperation} access for ${capabilityName}.`,
      resumePoint: `Record the callable surface and add ${requiredOperation} only after evidence passes.`,
    },
  };
}
