// Staging fixture for the Signature Hoodie — no imports needed (plain object)

/**
 * Staging fixture for the Signature Hoodie.
 *
 * Product media is intentionally absent. The media custodian has quarantined
 * every candidate asset, so this fixture must never expose an asset URL,
 * registry authority, approval state, or customer-renderable fallback.
 */
export const signatureHoodiePreview = {
  source: 'fixture',
  commerceMode: 'non-commerce',
  allowedEnvironment: 'local|preview',
  id: '9432704909549',
  handle: 'carlophillips-signature-hoodie',
  title: 'CARLOPHILLIPS Signature Hoodie',
  price: 180,
  currency: 'EUR',
  color: 'Black',
  decoration: 'CP chest embroidery',
  category: 'Hoodies in Clothing Tops',
  line: 'CARLOPHILLIPS Signature',
  statusLabel: 'Private fixture review — product media withheld',
  sizes: ['S', 'M', 'L'],
  description:
    'Heavyweight black pullover hoodie with restrained CP chest embroidery. Built as a premium core layer with structured fleece, a soft interior, and minimal front-chest branding.',
  story:
    'This fixture enables private journey review while quarantined product media remains withheld and release evidence is completed.',
  details: [
    ['Color', 'Black'],
    ['Construction', 'Heavyweight pullover hoodie'],
    ['Mark', 'CP embroidery, front chest'],
    ['Category', 'Hoodies in Clothing Tops'],
    ['Review state', 'Private non-commerce review; media quarantined'],
  ],
  mediaStatus: {
    state: 'withheld',
    reason: 'All product media is quarantined pending release review.',
    customerRenderable: false,
  },
  media: [],
};
