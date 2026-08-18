import 'server-only';

import release from '@/releases/cp-signature-hoodie-2026-001/release.json';
import mediaManifest from '@/releases/cp-signature-hoodie-2026-001/media-manifest.json';
import run from '@/runs/cp-hoodie-local-sim-001/run.json';
import registry from '@/config/capability-registry.json';
import authorities from '@/config/production-authorities.json';
import readiness from '@/config/end-to-end-capability-map.json';
import { deriveAdminControlPlane } from './control-plane';

export function loadAdminControlPlane() {
  return deriveAdminControlPlane({ release, mediaManifest, run, registry, authorities, readiness });
}
