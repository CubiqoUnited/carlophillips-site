const PROVIDER_NAME_PATTERN = /\b(?:shopify|modelize|apliiq)\b/i;
const GENERATED_MEDIA_PATTERN = /\bgenerated(?:\s+by)?\b/i;

function cleanText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function toProviderNeutralMediaAlt(value, productTitle) {
  const source = cleanText(value);
  const title = cleanText(productTitle) || 'Product';
  const generated = GENERATED_MEDIA_PATTERN.test(source) || /\bmodelize\b/i.test(source);
  const includesInternalSource = generated || PROVIDER_NAME_PATTERN.test(source);

  if (!source) return title;
  if (!includesInternalSource) return source;
  return generated
    ? `${title} — AI-assisted product visualisation`
    : `${title} — product view`;
}

export function toProviderNeutralMediaLabel(value) {
  const source = cleanText(value);
  const generated = GENERATED_MEDIA_PATTERN.test(source) || /\bmodelize\b/i.test(source);

  if (!source) return 'Product view';
  if (!PROVIDER_NAME_PATTERN.test(source)) return source;
  return generated
    ? 'AI-assisted product study · approval pending'
    : 'Recorded product view · approval pending';
}
