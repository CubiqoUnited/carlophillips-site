import {
  canUseFixtureData,
  getCommerceEnvironment,
} from '../config/product-visibility';
import type { CommerceEnvironment } from './runtime-types';

export interface CartLine {
  key: string;
  quantity: number;
  price: number | string;
  [key: string]: unknown;
}

export interface CommerceCart {
  schemaVersion: string;
  source: string;
  id: string | null;
  items: CartLine[];
  total: number;
  subtotal: number;
  checkoutUrl: string;
  totalQuantity: number;
}

class CartPolicyError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export const LOCAL_CART_FORBIDDEN = 'LOCAL_CART_FORBIDDEN';
export const SHOPIFY_CART_UNAVAILABLE = 'SHOPIFY_CART_UNAVAILABLE';

function policyError(code: string, message: string): CartPolicyError {
  return new CartPolicyError(code, message);
}

export function assertLocalCartAllowed(
  environment: CommerceEnvironment = getCommerceEnvironment()
): void {
  if (!canUseFixtureData(environment)) {
    throw policyError(
      LOCAL_CART_FORBIDDEN,
      `Local cart data is forbidden in the ${environment} commerce environment.`
    );
  }
}

export function unavailableCartError(
  environment: CommerceEnvironment = getCommerceEnvironment(),
  cause?: unknown
): CartPolicyError {
  const error = policyError(
    SHOPIFY_CART_UNAVAILABLE,
    `Shopify cart is unavailable in the ${environment} commerce environment.`
  );
  if (cause) error.cause = cause;
  return error;
}

export function createEmptyCart(source = 'fixture'): CommerceCart {
  return {
    schemaVersion: 'cp.commerce-cart.v1',
    source,
    id: null,
    items: [],
    total: 0,
    subtotal: 0,
    checkoutUrl: '',
    totalQuantity: 0,
  };
}

export function addLocalCartLine(
  cart: CommerceCart,
  line: CartLine
): CommerceCart {
  const quantity = Number(line.quantity ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new TypeError('Cart line quantity must be a positive integer.');
  }

  const items = cart.items.map((item) => ({ ...item }));
  const existing = items.find((item) => item.key === line.key);
  if (existing) existing.quantity += quantity;
  else items.push({ ...line, quantity });
  return withCartTotals({ ...cart, items });
}

export function updateLocalCartLine(
  cart: CommerceCart,
  itemKey: string,
  quantity: number
): CommerceCart {
  if (!Number.isInteger(quantity)) {
    throw new TypeError('Cart line quantity must be an integer.');
  }
  if (quantity <= 0) return removeLocalCartLine(cart, itemKey);

  const items = cart.items.map((item) =>
    item.key === itemKey ? { ...item, quantity } : { ...item }
  );
  return withCartTotals({ ...cart, items });
}

export function removeLocalCartLine(
  cart: CommerceCart,
  itemKey: string
): CommerceCart {
  return withCartTotals({
    ...cart,
    items: cart.items
      .filter((item) => item.key !== itemKey)
      .map((item) => ({ ...item })),
  });
}

export function withCartTotals(cart: CommerceCart): CommerceCart {
  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const totalQuantity = cart.items.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );
  return { ...cart, total, subtotal: total, totalQuantity };
}

export async function restoreOrCreateCart({
  cartId,
  getCart,
  createCart,
}: {
  cartId?: string | null;
  getCart: (id: string) => Promise<CommerceCart | null>;
  createCart: () => Promise<CommerceCart>;
}) {
  if (cartId) {
    try {
      const restored = await getCart(cartId);
      if (restored?.id) return { cart: restored, disposition: 'restored' };
    } catch {
      // Expired and unknown carts are replaced by Shopify, never by a fixture cart.
    }
  }

  const created = await createCart();
  if (!created?.id) throw new Error('Shopify returned a cart without an id.');
  return { cart: created, disposition: cartId ? 'replaced' : 'created' };
}

export function parseCheckoutHosts(value = ''): string[] {
  return value
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export function validateCheckoutUrl(
  value: string | null | undefined,
  allowedHosts: string[] = []
): string {
  if (!value) return '';
  let url;
  try {
    url = new URL(value);
  } catch {
    return '';
  }

  const hosts = allowedHosts
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  if (url.protocol !== 'https:' || !hosts.includes(url.hostname.toLowerCase()))
    return '';
  return url.toString();
}
