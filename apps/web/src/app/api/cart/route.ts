import { NextResponse } from 'next/server';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import { assertRuntimePreflight } from '@/lib/config/runtime-preflight';
import {
  addShopifyCartLine,
  readShopifyCart,
  removeShopifyCartLine,
  trustedCartCheckoutUrl,
  updateShopifyCartLine,
} from '@/lib/commerce/shopify-cart-server';
import { evaluateCorsRequest } from '@/lib/http/cors-policy';

export const dynamic = 'force-dynamic';
const CART_COOKIE = 'cp_shopify_cart';

export async function GET(request: Request) {
  const cartId = request.headers
    .get('cookie')
    ?.match(/(?:^|;\s*)cp_shopify_cart=([^;]+)/)?.[1];
  const environment = getCommerceEnvironment();
  try {
    const cart = await readShopifyCart({
      cartId: cartId ? decodeURIComponent(cartId) : null,
      environment,
    });
    const count =
      cart?.lines.edges.reduce((total, { node }) => total + node.quantity, 0) ||
      0;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 503 });
  }
}

function originAllowed(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const protocol =
    request.headers.get('x-forwarded-proto') === 'http' ? 'http' : 'https';
  const origin = forwardedHost ? `${protocol}://${forwardedHost}` : url.origin;
  return evaluateCorsRequest(request.headers.get('origin'), undefined, origin)
    .allowed;
}

export async function POST(request: Request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });
  }
  const form = await request.formData();
  const action = String(form.get('cartAction') || 'add');
  const cartId = request.headers
    .get('cookie')
    ?.match(/(?:^|;\s*)cp_shopify_cart=([^;]+)/)?.[1];
  const decodedCartId = cartId ? decodeURIComponent(cartId) : null;
  const environment = getCommerceEnvironment();
  try {
    if (environment !== 'local') assertRuntimePreflight(environment);
    if (action === 'checkout') {
      const cart = await readShopifyCart({
        cartId: decodedCartId,
        environment,
      });
      if (!cart) throw new Error('SHOPIFY_CART_NOT_FOUND');
      const checkoutUrl = trustedCartCheckoutUrl(cart, environment);
      if (request.headers.get('accept')?.includes('application/json')) {
        return NextResponse.json({ ok: true, checkoutUrl });
      }
      return NextResponse.redirect(checkoutUrl, 303);
    }
    let cart;
    if (action === 'update') {
      cart = await updateShopifyCartLine({
        cartId: decodedCartId || '',
        lineId: String(form.get('lineId') || ''),
        quantity: Number(form.get('quantity')),
        environment,
      });
    } else if (action === 'remove') {
      cart = await removeShopifyCartLine({
        cartId: decodedCartId || '',
        lineId: String(form.get('lineId') || ''),
        environment,
      });
    } else {
      cart = await addShopifyCartLine({
        cartId: decodedCartId,
        handle: String(form.get('handle') || ''),
        selectionReferenceHash: String(form.get('referenceHash') || ''),
        quantity: Number(form.get('quantity')),
        environment,
      });
    }
    const wantsJson = request.headers
      .get('accept')
      ?.includes('application/json');
    const count =
      cart.lines.edges.reduce((total, { node }) => total + node.quantity, 0) ||
      0;
    const bagUrl = new URL('/bag', request.url);
    if (action === 'add') bagUrl.searchParams.set('added', '1');
    const response = wantsJson
      ? NextResponse.json({ ok: true, count })
      : NextResponse.redirect(bagUrl, 303);
    response.cookies.set(CART_COOKIE, cart.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: environment !== 'local',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
    });
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : 'SHOPIFY_CART_FAILED';
    return NextResponse.json({ error: code }, { status: 409 });
  }
}
