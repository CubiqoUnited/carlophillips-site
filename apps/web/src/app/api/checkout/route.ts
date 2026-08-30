import { NextResponse } from 'next/server';
import { createApprovedHoodieCheckout } from '@/lib/commerce/shopify-checkout-server';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import { getProductReleaseEvidence } from '@/lib/releases/product-release-registry';
import type { ProductReleaseEvidence } from '@/types';
import { evaluateCorsRequest } from '@/lib/http/cors-policy';
import checkoutAuthorization from '../../../../../../config/shopify-checkout-authorization.json';

export const dynamic = 'force-dynamic';

interface CheckoutRequest {
  handle: string;
  referenceHash: string;
  quantity: number;
  releaseRecord?: ProductReleaseEvidence['releaseRecord'];
  mediaManifest?: ProductReleaseEvidence['mediaManifest'];
  environment: ReturnType<typeof getCommerceEnvironment>;
  checkoutAuthorization: typeof checkoutAuthorization;
}

type CheckoutResult =
  { ok: true; checkoutUrl: string } | { ok: false; reason: string };

const loadReleaseEvidence = getProductReleaseEvidence as (
  handle: string
) => ProductReleaseEvidence | null;
const createCheckout = createApprovedHoodieCheckout as (
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
  const releaseEvidence = loadReleaseEvidence(handle);
  const result = await createCheckout({
    handle,
    referenceHash: String(form.get('referenceHash') || ''),
    quantity: Number(form.get('quantity')),
    environment: getCommerceEnvironment(),
    checkoutAuthorization,
    ...(releaseEvidence || {}),
  });
  if (!result.ok)
    return NextResponse.json({ error: result.reason }, { status: 409 });
  return NextResponse.redirect(new URL(result.checkoutUrl, request.url), 303);
}
