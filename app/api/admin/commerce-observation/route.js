import { NextResponse } from 'next/server';
import { evaluateAdminRequest } from '@/lib/admin/access-server';
import { loadShopifyProduct } from '@/lib/providers/shopify/storefront-product-adapter';
import release from '../../../../releases/cp-signature-hoodie-2026-001/release.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function noStoreJson(body, status) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, private' },
  });
}

export async function GET(request) {
  const access = await evaluateAdminRequest(request.headers, {
    requiredRole: 'product_owner',
  });
  if (!access.allowed) return noStoreJson({ error: 'Not found' }, 404);

  try {
    const product = await loadShopifyProduct(release.shopify.handle);
    if (!product?.observation) {
      return noStoreJson({ error: 'Product observation unavailable' }, 503);
    }

    return noStoreJson({
      releaseId: release.releaseId,
      handle: release.shopify.handle,
      observation: product.observation,
    }, 200);
  } catch {
    return noStoreJson({ error: 'Product observation unavailable' }, 503);
  }
}
