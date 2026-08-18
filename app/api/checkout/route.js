import { NextResponse } from 'next/server';
import { createApprovedHoodieCheckout } from '@/lib/commerce/shopify-checkout-server';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import { getProductReleaseEvidence } from '@/lib/releases/product-release-registry';
import checkoutAuthorization from '@/config/shopify-checkout-authorization.json';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const origin = request.headers.get('origin');
  if (!origin) {
    return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });
  }
  try {
    if (new URL(origin).host !== new URL(request.url).host) {
      return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });
  }
  const form = await request.formData();
  const handle = String(form.get('handle') || '');
  const releaseEvidence = getProductReleaseEvidence(handle);
  const result = await createApprovedHoodieCheckout({
    handle,
    referenceHash: String(form.get('referenceHash') || ''),
    quantity: Number(form.get('quantity')),
    environment: getCommerceEnvironment(),
    checkoutAuthorization,
    ...(releaseEvidence || {}),
  });
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 409 });
  return NextResponse.redirect(result.checkoutUrl, 303);
}
