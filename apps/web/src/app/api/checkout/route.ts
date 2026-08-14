import { NextResponse } from 'next/server';
import { createApprovedHoodieCheckout } from '@/lib/commerce/shopify-checkout-server';
import { getProductReleaseEvidence } from '@/lib/releases/product-release-registry';
import type { ProductReleaseEvidence } from '@/types';

export const dynamic = 'force-dynamic';

interface CheckoutRequest {
  handle: string;
  referenceHash: string;
  quantity: number;
  releaseRecord?: ProductReleaseEvidence['releaseRecord'];
  mediaManifest?: ProductReleaseEvidence['mediaManifest'];
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
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });
    }
  }
  const form = await request.formData();
  const handle = String(form.get('handle') || '');
  const releaseEvidence = loadReleaseEvidence(handle);
  const result = await createCheckout({
    handle,
    referenceHash: String(form.get('referenceHash') || ''),
    quantity: Number(form.get('quantity')),
    ...(releaseEvidence || {}),
  });
  if (!result.ok)
    return NextResponse.json({ error: result.reason }, { status: 409 });
  return NextResponse.redirect(result.checkoutUrl, 303);
}
