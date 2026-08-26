import { describe, expect, it } from 'vitest';
import {
  BAG_SCHEMA,
  DISCOUNT_STATUS,
  addLine,
  applyDiscount,
  bagCount,
  bagLineKey,
  bagTotals,
  clearBag,
  emptyBag,
  readBag,
  removeLine,
  setQuantity,
} from '../lib/commerce/client-bag.js';
import {
  DISCOVERY_CATEGORIES,
  discoveryCategoryCards,
  discoveryProductCards,
  releasedProductCards,
} from '../lib/commerce/discovery-catalog.js';
import { INTAKE_STATUS, validateEmailSignup, validateSupportRequest } from '../lib/site/contact-intake.js';

const line = {
  handle: 'carlophillips-signature-hoodie',
  referenceHash: 'sha256:aaa',
  title: 'ONE',
  size: 'M',
  currency: 'EUR',
  unitPrice: 180,
  quantity: 1,
};

describe('client bag', () => {
  it('adds, merges by variant, changes quantity and removes', () => {
    const one = addLine(emptyBag, line);
    const merged = addLine(one, line);
    expect(merged.lines).toHaveLength(1);
    expect(merged.lines[0].quantity).toBe(2);

    const two = addLine(merged, { ...line, referenceHash: 'sha256:bbb', size: 'L' });
    expect(two.lines).toHaveLength(2);
    expect(bagCount(two)).toBe(3);

    const raised = setQuantity(two, bagLineKey(two.lines[1]), 4);
    expect(raised.lines[1].quantity).toBe(4);
    expect(setQuantity(raised, bagLineKey(raised.lines[1]), 0).lines).toHaveLength(1);
    expect(removeLine(two, 'sha256:aaa').lines.map(item => item.size)).toEqual(['L']);
    expect(clearBag()).toBe(emptyBag);
  });

  it('rejects a stored bag that does not match the current schema', () => {
    expect(readBag(null)).toBe(emptyBag);
    expect(readBag({ schemaVersion: 'other', lines: [line] })).toBe(emptyBag);
    expect(readBag({ schemaVersion: BAG_SCHEMA, lines: [line, { handle: 'x' }] }).lines).toHaveLength(1);
    expect(readBag({ schemaVersion: BAG_SCHEMA, lines: [{ ...line, quantity: -3 }] }).lines[0].quantity).toBe(1);
  });

  /*
   * An unrecognised code must leave the total untouched — the appendix "Discount code not
   * recognised" state says so explicitly, and discount authority belongs to the hosted checkout.
   */
  it('leaves the total unchanged for a code it does not recognise', () => {
    const bag = addLine(emptyBag, line);
    const rejected = applyDiscount(bag, 'anything', []);
    expect(rejected.discount).toMatchObject({ code: 'ANYTHING', status: DISCOUNT_STATUS.rejected });
    expect(bagTotals(rejected).total).toBe(180);

    const applied = applyDiscount(bag, 'cp10', [{ code: 'CP10', percentage: 10 }]);
    expect(applied.discount.status).toBe(DISCOUNT_STATUS.applied);
    expect(bagTotals(applied)).toMatchObject({ subtotal: 180, discountAmount: 18, total: 162 });
    expect(applyDiscount(bag, '   ', []).discount.status).toBe(DISCOUNT_STATUS.idle);
  });
});

describe('discovery catalog overlays', () => {
  const summary = {
    visibleCount: 1,
    primaryProduct: {
      handle: 'carlophillips-signature-hoodie',
      title: 'CARLOPHILLIPS Signature Hoodie',
      href: '/products/carlophillips-signature-hoodie',
      price: 180,
      currency: 'EUR',
      media: [{ url: '/a.jpg', alt: 'a' }],
    },
  };

  it('derives counts from what the release actually made visible', () => {
    const cards = discoveryCategoryCards(summary);
    expect(cards).toHaveLength(DISCOVERY_CATEGORIES.length);
    expect(cards.find(card => card.id === 'hoodies')).toMatchObject({ meta: '1 item', available: true, viewing: true });
    for (const card of cards.filter(card => card.id !== 'hoodies')) {
      expect(card).toMatchObject({ meta: 'Not yet released', available: false, viewing: false });
    }
  });

  it('shows nothing when the release decision withheld the product', () => {
    expect(releasedProductCards({ visibleCount: 0, primaryProduct: null })).toEqual([]);
    expect(discoveryProductCards({ visibleCount: 0, primaryProduct: null })).toEqual([]);
    for (const card of discoveryCategoryCards({ visibleCount: 0, primaryProduct: null })) {
      expect(card.available).toBe(false);
    }
  });

  it('prices the product grid from the release decision', () => {
    const [card] = discoveryProductCards(summary, 'hoodies', 'carlophillips-signature-hoodie');
    expect(card).toMatchObject({ name: 'CARLOPHILLIPS Signature Hoodie', meta: '€180', viewing: true });
  });
});

describe('support and private-list intake', () => {
  it('requires name, a real email and a message', () => {
    expect(validateSupportRequest({ name: 'A', email: 'a@b.co', message: 'Hi' })).toEqual({ valid: true, missing: [] });
    expect(validateSupportRequest({ name: ' ', email: 'nope', message: '' }).missing).toEqual(['name', 'email', 'message']);
    expect(validateEmailSignup('a@b.co')).toBe(true);
    expect(validateEmailSignup('a@b')).toBe(false);
    expect(validateEmailSignup('')).toBe(false);
  });

  it('never reports a request as sent without a configured destination', async () => {
    const { supportDestination, privateListDestination } = await import('../lib/site/contact-intake.js');
    expect(supportDestination({})).toBe(null);
    expect(supportDestination({ CP_SUPPORT_WEBHOOK_URL: 'http://insecure.example' })).toBe(null);
    expect(supportDestination({ CP_SUPPORT_WEBHOOK_URL: 'https://intake.example/support' })).toBe('https://intake.example/support');
    expect(privateListDestination({})).toBe(null);
    expect(INTAKE_STATUS.unavailable).toBe('unavailable');
  });
});
