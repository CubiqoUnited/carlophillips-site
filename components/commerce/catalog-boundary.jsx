import React from 'react';
import { CommerceCatalogState } from './catalog-state';
import { closedCatalogDecision, getCatalogDecision } from '@/lib/commerce/catalog-gateway';
import { resolveCommerceDataMode } from '@/lib/commerce/product-gateway';
import {
  canRenderDraftProductPreviews,
  canRenderProducts,
  getCommerceEnvironment,
} from '@/lib/config/product-visibility';
import { loadShopifyProduct } from '@/lib/providers/shopify/storefront-product-adapter';
import {
  getProductReleaseEvidence,
  listProductReleaseHandles,
} from '@/lib/releases/product-release-registry';

export async function CommerceCatalogBoundary({ pageLabel }) {
  const environment = getCommerceEnvironment();
  const candidateHandles = listProductReleaseHandles();

  if (!canRenderProducts()) {
    return (
      <CommerceCatalogState
        decision={closedCatalogDecision(environment, candidateHandles.length)}
        pageLabel={pageLabel}
      />
    );
  }

  const mode = resolveCommerceDataMode({
    configuredMode: process.env.COMMERCE_DATA_MODE,
    environment,
  });
  let fixtureProducts = [];
  if (mode === 'fixture' && canRenderDraftProductPreviews()) {
    const fixtureModule = await import('@/fixtures/signature-hoodie-preview');
    fixtureProducts = [fixtureModule.signatureHoodiePreview];
  }

  const decision = await getCatalogDecision({
    environment,
    mode,
    candidateHandles,
    fixtureProducts,
    getReleaseEvidence: getProductReleaseEvidence,
    loadShopifyProduct,
  });

  return <CommerceCatalogState decision={decision} pageLabel={pageLabel} />;
}
