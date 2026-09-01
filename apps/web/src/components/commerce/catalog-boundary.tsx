import React from 'react';
import type { CatalogDecision } from '@/types';
import { CommerceCatalogState } from './catalog-state';
import { getServerCatalogDecision } from '@/lib/commerce/catalog-server';

const loadCatalogDecision =
  getServerCatalogDecision as () => Promise<CatalogDecision>;

export async function CommerceCatalogBoundary({
  pageLabel,
}: {
  pageLabel?: string;
}) {
  const decision = await loadCatalogDecision();
  return <CommerceCatalogState decision={decision} pageLabel={pageLabel} />;
}
