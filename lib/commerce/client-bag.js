/*
 * Client bag state.
 *
 * The workbook's happy path (Landing -> discovery -> order -> cart -> checkout -> confirmation)
 * needs a bag that survives a route change, so the cart drawer, checkout and confirmation screens
 * all read one store. This module is the pure part: reducers and totals with no browser access, so
 * the same rules are testable and render identically on the server.
 *
 * It is presentation state only. It is not commerce authority: prices, availability and the order
 * itself are decided by the secure hosted checkout, never by this store.
 */

export const BAG_STORAGE_KEY = 'cp-bag-v1';
export const BAG_SCHEMA = 'cp.client-bag.v1';

export const DISCOUNT_STATUS = Object.freeze({
  idle: 'idle',
  applied: 'applied',
  rejected: 'rejected',
});

export const emptyBag = Object.freeze({
  schemaVersion: BAG_SCHEMA,
  lines: Object.freeze([]),
  discount: Object.freeze({ code: '', status: DISCOUNT_STATUS.idle }),
});

function lineKey(line) {
  return line.referenceHash || `${line.handle}:${line.size}`;
}

function normaliseLine(line) {
  return {
    handle: line.handle,
    referenceHash: line.referenceHash || '',
    title: line.title,
    size: line.size,
    color: line.color || 'Black',
    currency: line.currency,
    unitPrice: Number(line.unitPrice) || 0,
    quantity: Math.max(1, Math.trunc(Number(line.quantity) || 1)),
    imageUrl: line.imageUrl || null,
    imageAlt: line.imageAlt || '',
  };
}

export function readBag(candidate) {
  if (!candidate || candidate.schemaVersion !== BAG_SCHEMA || !Array.isArray(candidate.lines)) return emptyBag;
  return {
    schemaVersion: BAG_SCHEMA,
    lines: candidate.lines.filter(line => line?.handle && line?.size).map(normaliseLine),
    discount: {
      code: candidate.discount?.code || '',
      status: Object.values(DISCOUNT_STATUS).includes(candidate.discount?.status)
        ? candidate.discount.status
        : DISCOUNT_STATUS.idle,
    },
  };
}

export function addLine(bag, line) {
  const incoming = normaliseLine(line);
  const key = lineKey(incoming);
  const existing = bag.lines.find(item => lineKey(item) === key);
  const lines = existing
    ? bag.lines.map(item => lineKey(item) === key ? { ...item, quantity: item.quantity + incoming.quantity } : item)
    : [...bag.lines, incoming];
  return { ...bag, lines };
}

export function setQuantity(bag, key, quantity) {
  const next = Math.trunc(Number(quantity) || 0);
  if (next <= 0) return removeLine(bag, key);
  return { ...bag, lines: bag.lines.map(item => lineKey(item) === key ? { ...item, quantity: next } : item) };
}

export function removeLine(bag, key) {
  return { ...bag, lines: bag.lines.filter(item => lineKey(item) !== key) };
}

export function clearBag() {
  return emptyBag;
}

export function bagLineKey(line) {
  return lineKey(line);
}

export function bagCount(bag) {
  return bag.lines.reduce((total, line) => total + line.quantity, 0);
}

/*
 * Discount validation is deliberately local and conservative: it recognises only codes the release
 * configuration lists, and a code it does not recognise leaves the cart total untouched — the
 * appendix "Discount code not recognised" state. Real discount authority stays with the store.
 */
export function applyDiscount(bag, rawCode, recognisedCodes = []) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { ...bag, discount: { code: '', status: DISCOUNT_STATUS.idle } };
  const match = recognisedCodes.find(entry => entry.code.toUpperCase() === code) || null;
  if (!match) return { ...bag, discount: { code, status: DISCOUNT_STATUS.rejected } };
  return { ...bag, discount: { code: match.code.toUpperCase(), status: DISCOUNT_STATUS.applied, percentage: match.percentage } };
}

export function bagTotals(bag) {
  const currency = bag.lines[0]?.currency || 'EUR';
  const subtotal = bag.lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
  const discountPercentage = bag.discount.status === DISCOUNT_STATUS.applied ? Number(bag.discount.percentage) || 0 : 0;
  const discountAmount = Math.round(subtotal * discountPercentage) / 100;
  return {
    currency,
    itemCount: bagCount(bag),
    subtotal,
    discountAmount,
    total: Math.max(0, subtotal - discountAmount),
  };
}
