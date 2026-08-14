import type { RuntimeProduct } from '../lib/commerce/runtime-types';

export const signatureHoodiePreview = {
  source: 'fixture',
  commerceMode: 'non-commerce',
  allowedEnvironment: 'local',
  id: '9432704909549',
  handle: 'carlophillips-signature-hoodie',
  title: 'CARLOPHILLIPS Signature Hoodie',
  price: 128,
  currency: 'USD',
  color: 'Black',
  decoration: 'CP chest embroidery',
  category: 'Hoodies in Clothing Tops',
  line: 'CARLOPHILLIPS Signature',
  statusLabel: 'Local fixture review — not Shopify live data',
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'],
  description:
    'Heavyweight black pullover hoodie with restrained CP chest embroidery. Built as a premium core layer with structured fleece, a soft interior, and minimal front-chest branding.',
  story:
    'This fixture preserves layout review while product, media, and fulfillment evidence are bound into a Product Release Record. It is not approval to sell or publish.',
  details: [
    ['Data source', 'Local fixture — not live Shopify data'],
    ['Color candidate', 'Black'],
    ['Construction candidate', 'Heavyweight pullover hoodie'],
    ['Mark candidate', 'CP embroidery, front chest'],
    ['Category', 'Hoodies in Clothing Tops'],
    ['Review state', 'Local non-commerce review'],
  ],
  media: [],
} satisfies RuntimeProduct;
