import {
  evaluateProductReleaseEvidence as evaluateCanonicalEvidence,
  evaluateProductReleaseTransition as evaluateCanonicalTransition,
} from '../../../../../lib/releases/product-release-transition.js';
import type {
  MediaManifest,
  ReleaseRecord,
  ReleaseState,
} from '../commerce/runtime-types';

interface EvidenceInput {
  record: ReleaseRecord;
  manifest: MediaManifest | null;
  targetState?: ReleaseState;
}

interface TransitionInput extends EvidenceInput {
  targetState: ReleaseState;
}

/** Keep the storefront and operational tooling on one release evaluator. */
export function evaluateProductReleaseEvidence(input: EvidenceInput) {
  return evaluateCanonicalEvidence(input);
}

export function evaluateProductReleaseTransition(input: TransitionInput) {
  return evaluateCanonicalTransition(input);
}
