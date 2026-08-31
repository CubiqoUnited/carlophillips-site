import { NextResponse } from 'next/server';
import { createShopifyCheckout } from '@/lib/commerce/shopify-checkout-server';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import { evaluateCorsRequest } from '@/lib/http/cors-policy';

export const dynamic = 'force-dynamic';

interface CheckoutRequest {
  handle: string;
  referenceHash: string;
  quantity: number;
  environment: ReturnType<typeof getCommerceEnvironment>;
}

type CheckoutResult =
  { ok: true; checkoutUrl: string } | { ok: false; reason: string };

const createCheckout = createShopifyCheckout as (
  request: CheckoutRequest
) => Promise<CheckoutResult>;

export async function POST(request: Request) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProtocol = request.headers.get('x-forwarded-proto');
  const requestUrl = new URL(request.url);
  const publicRequestOrigin = forwardedHost
    ? `${forwardedProtocol === 'http' ? 'http' : 'https'}://${forwardedHost}`
    : requestUrl.origin;
  const corsDecision = evaluateCorsRequest(
    request.headers.get('origin'),
    undefined,
    publicRequestOrigin
  );
  if (!corsDecision.allowed) {
    return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });
  }
  const form = await request.formData();
  const handle = String(form.get('handle') || '');
  const result = await createCheckout({
    handle,
    referenceHash: String(form.get('referenceHash') || ''),
    quantity: Number(form.get('quantity')),
    environment: getCommerceEnvironment(),
  });
  if (!result.ok)
    return NextResponse.json({ error: result.reason }, { status: 409 });
  return NextResponse.redirect(new URL(result.checkoutUrl, request.url), 303);
}
