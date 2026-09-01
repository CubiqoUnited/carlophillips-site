import { createHash } from 'node:crypto';

const MODALITY_KINDS = {
  front: ['image'],
  'back-angle': ['image'],
  'embroidery-detail': ['image'],
  'material-detail': ['image'],
  'on-model': ['image'],
  lifestyle: ['image'],
  'spin-360': ['spin'],
  'model-3d-ar': ['model_3d'],
  video: ['video', 'external_video'],
};

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function canonicalMediaUrl(value) {
  if (!hasText(value)) return '';
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:') return null;
    url.hash = '';
    url.searchParams.sort();
    return url.toString();
  } catch {
    return null;
  }
}

function isApprovedAsset(asset) {
  return (
    asset?.exactProductMatch === 'verified' &&
    asset?.rightsStatus === 'verified' &&
    asset?.approvalStatus === 'approved' &&
    asset?.quality?.status === 'verified' &&
    hasText(asset?.quality?.evidence) &&
    asset?.source?.type !== 'unknown' &&
    asset?.storefrontBinding?.adapter === 'shopify-storefront-media' &&
    /^sha256:[a-f0-9]{64}$/.test(
      asset?.storefrontBinding?.referenceHash || ''
    ) &&
    hasText(asset?.storefrontBinding?.evidence)
  );
}

export function hashStorefrontMediaReference(reference) {
  if (!hasText(reference)) return null;
  return `sha256:${createHash('sha256').update(reference.trim()).digest('hex')}`;
}

export function fingerprintStorefrontMedia(item) {
  const url = canonicalMediaUrl(item?.url);
  const previewUrl = canonicalMediaUrl(item?.previewUrl);
  if (
    !hasText(item?.id) ||
    !hasText(item?.type) ||
    url === null ||
    previewUrl === null ||
    (!url && !previewUrl)
  )
    return null;
  return hashStorefrontMediaReference(
    JSON.stringify({
      id: item.id.trim(),
      type: item.type.trim(),
      url,
      previewUrl,
    })
  );
}

function sanitizeShopifyMedia(observedMedia, approvalStatus, sourceAuthority) {
  const seen = new Set();
  const media = [];

  for (const item of observedMedia) {
    const referenceHash = fingerprintStorefrontMedia(item);
    const url = canonicalMediaUrl(item?.url);
    const previewUrl = canonicalMediaUrl(item?.previewUrl);
    if (
      !referenceHash ||
      seen.has(referenceHash) ||
      url === null ||
      previewUrl === null
    )
      continue;
    seen.add(referenceHash);
    const safeItem = { ...item };
    delete safeItem.registryAssetId;
    delete safeItem.rawReference;
    media.push({
      ...safeItem,
      id: referenceHash,
      url: url || '',
      previewUrl: previewUrl || '',
      alt: hasText(item.alt) ? item.alt.trim() : '',
      approvalStatus,
      sourceAuthority,
      label:
        approvalStatus === 'approved'
          ? 'Approved Shopify staging media'
          : 'Shopify staging media',
      modalities: [],
    });
  }

  return media;
}

export function fingerprintShopifyMediaSet(observedMedia) {
  const media = Array.isArray(observedMedia) ? observedMedia : [];
  const references = media
    .map((item) => fingerprintStorefrontMedia(item))
    .filter(Boolean);
  return hashStorefrontMediaReference(JSON.stringify(references));
}

export function projectShopifyMedia({ product, approvedFingerprint = null }) {
  const observedMedia = Array.isArray(product?.media) ? product.media : [];
  const currentFingerprint = fingerprintShopifyMediaSet(observedMedia);
  const approved = Boolean(
    approvedFingerprint && approvedFingerprint === currentFingerprint
  );
  const media = sanitizeShopifyMedia(
    observedMedia,
    approved ? 'approved' : 'staging-review',
    approved ? 'shopify-staging-approved-snapshot' : 'shopify-canonical-staging'
  );

  return {
    product: {
      ...product,
      images: media
        .filter((item) => item.type === 'image')
        .map((item) => item.url),
      media,
      heroImage:
        media.find((item) => item.previewUrl)?.previewUrl ||
        media.find((item) => item.url)?.url ||
        '',
      mediaReview: {
        status: approved ? 'complete' : 'staging-review',
        coveredModalities: [],
        missingModalities: [],
        missingFallbackCount: 0,
      },
    },
    includedCount: media.length,
    excludedCount: observedMedia.length - media.length,
    currentFingerprint,
    productionReady: approved && media.length > 0,
  };
}

export function filterReleaseBoundMedia({ product, manifest }) {
  const requirements = Array.isArray(manifest?.requirements)
    ? manifest.requirements
    : [];
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  const manifestAssetsById = new Map(
    assets.map((asset) => [asset?.assetId, asset])
  );
  const approvedKindsByAssetId = new Map();
  const modalitiesByAssetId = new Map();
  for (const requirement of requirements.filter(
    (item) => item.status === 'approved'
  )) {
    for (const assetId of requirement.assetIds) {
      const kinds = approvedKindsByAssetId.get(assetId) || new Set();
      for (const kind of MODALITY_KINDS[requirement.modality] || [])
        kinds.add(kind);
      approvedKindsByAssetId.set(assetId, kinds);
      const modalities = modalitiesByAssetId.get(assetId) || new Set();
      modalities.add(requirement.modality);
      modalitiesByAssetId.set(assetId, modalities);
    }
  }
  for (const assetId of [...approvedKindsByAssetId.keys()]) {
    const fallbackAssetId = manifestAssetsById.get(assetId)?.fallbackAssetId;
    if (!fallbackAssetId) continue;
    const kinds = approvedKindsByAssetId.get(fallbackAssetId) || new Set();
    kinds.add('image');
    approvedKindsByAssetId.set(fallbackAssetId, kinds);
  }
  const assetsByBinding = new Map();
  const duplicateBindings = new Set();
  const assetIdCounts = assets.reduce((counts, asset) => {
    counts.set(asset?.assetId, (counts.get(asset?.assetId) || 0) + 1);
    return counts;
  }, new Map());

  for (const asset of assets) {
    const approvedKinds = approvedKindsByAssetId.get(asset?.assetId);
    if (
      !approvedKinds?.has(asset?.kind) ||
      assetIdCounts.get(asset?.assetId) !== 1 ||
      !isApprovedAsset(asset)
    )
      continue;
    const referenceHash = asset.storefrontBinding.referenceHash;
    if (assetsByBinding.has(referenceHash))
      duplicateBindings.add(referenceHash);
    assetsByBinding.set(referenceHash, asset);
  }
  for (const referenceHash of duplicateBindings)
    assetsByBinding.delete(referenceHash);

  const observedMedia = Array.isArray(product?.media) ? product.media : [];
  const seenReferences = new Set();
  const media = [];
  for (const item of observedMedia) {
    const referenceHash = fingerprintStorefrontMedia(item);
    if (!referenceHash || seenReferences.has(referenceHash)) continue;
    seenReferences.add(referenceHash);
    const asset = assetsByBinding.get(referenceHash);
    if (!asset || asset.kind !== item.type) continue;
    media.push({
      ...item,
      id: asset.assetId,
      url: canonicalMediaUrl(item.url),
      previewUrl: canonicalMediaUrl(item.previewUrl),
      alt: asset.alt,
      label: [
        ...(modalitiesByAssetId.get(asset.assetId) || ['accessible fallback']),
      ].join(' / '),
    });
  }
  const matchedAssetIds = new Set(media.map((item) => item.id));
  const missingModalities = requirements
    .filter(
      (requirement) =>
        requirement.status !== 'infeasible-approved' &&
        (requirement.status !== 'approved' ||
          !requirement.assetIds.some((assetId) => matchedAssetIds.has(assetId)))
    )
    .map((requirement) => requirement.modality);
  const missingFallbackAssetIds = media
    .map((item) => manifestAssetsById.get(item.id))
    .filter((asset) =>
      ['video', 'external_video', 'model_3d', 'spin'].includes(asset?.kind)
    )
    .map((asset) => asset.fallbackAssetId || `missing:${asset.assetId}`)
    .filter((assetId) => !matchedAssetIds.has(assetId));
  const coveredModalities = requirements
    .filter(
      (requirement) =>
        requirement.status === 'infeasible-approved' ||
        requirement.assetIds.some((assetId) => matchedAssetIds.has(assetId))
    )
    .map((requirement) => requirement.modality);
  const productionReady =
    missingModalities.length === 0 && missingFallbackAssetIds.length === 0;

  return {
    product: {
      ...product,
      images: media
        .filter((item) => item.type === 'image')
        .map((item) => item.url),
      media,
      heroImage:
        media.find((item) => item.previewUrl)?.previewUrl ||
        media.find((item) => item.url)?.url ||
        '',
      mediaReview: {
        status: productionReady ? 'complete' : 'incomplete',
        coveredModalities,
        missingModalities,
        missingFallbackCount: [...new Set(missingFallbackAssetIds)].length,
      },
    },
    includedCount: media.length,
    excludedCount: observedMedia.length - media.length,
    coveredModalities,
    missingModalities,
    missingFallbackAssetIds: [...new Set(missingFallbackAssetIds)],
    productionReady,
  };
}
