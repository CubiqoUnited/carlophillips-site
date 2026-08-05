import { NextResponse } from 'next/server';
import { createApprovedHoodieCheckout } from '@/lib/commerce/shopify-checkout-server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
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
  const result = await createApprovedHoodieCheckout({
    handle: String(form.get('handle') || ''),
    referenceHash: String(form.get('referenceHash') || ''),
    quantity: Number(form.get('quantity')),
  });
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 409 });
  return NextResponse.redirect(result.checkoutUrl, 303);
}
