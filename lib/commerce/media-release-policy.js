export function evaluateMediaRelease(manifest) {
  const unresolved = manifest.requirements.filter(requirement => {
    if (requirement.status === 'approved') return false;
    return !(
      requirement.requirement === 'where-feasible'
      && requirement.status === 'infeasible-approved'
      && requirement.infeasibilityBlocker?.approvalStatus === 'approved'
    );
  });

  return {
    ready: unresolved.length === 0,
    unresolved: unresolved.map(requirement => ({
      modality: requirement.modality,
      status: requirement.status,
    })),
  };
}
