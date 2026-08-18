import 'server-only';

import release from '@/releases/cp-signature-hoodie-2026-001/release.json';
import mediaManifest from '@/releases/cp-signature-hoodie-2026-001/media-manifest.json';
import run from '@/runs/cp-hoodie-local-sim-001/run.json';
import registry from '@/config/capability-registry.json';
import authorities from '@/config/production-authorities.json';
import readiness from '@/config/end-to-end-capability-map.json';
import mediaGenerationWorkspace from '@/releases/cp-signature-hoodie-2026-001/media-generation-workspace.json';
import providerHandshakeRegistry from '@/config/media-generation-provider-handshakes.json';
import { deriveAdminControlPlane } from './control-plane';
import { deriveMediaGenerationWorkspace } from '../media/media-generation-workspace';
import { deriveProviderHandshakes } from '../media/provider-handshakes';

export function loadAdminControlPlane() {
  return deriveAdminControlPlane({ release, mediaManifest, run, registry, authorities, readiness });
}

export function loadMediaGenerationWorkspace({ featureEnabled, role }) {
  const providerHandshakes = deriveProviderHandshakes({
    registry: providerHandshakeRegistry,
    environment: process.env,
  });
  return deriveMediaGenerationWorkspace({
    workspace: mediaGenerationWorkspace,
    release,
    mediaManifest,
    featureEnabled,
    role,
    providerHandshakes,
  });
}
