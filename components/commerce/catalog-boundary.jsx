import React from 'react';
import { CommerceCatalogState } from './catalog-state';
import { getServerCatalogDecision } from '@/lib/commerce/catalog-server';

export async function CommerceCatalogBoundary({ pageLabel }) {
  const decision = await getServerCatalogDecision();
  return <CommerceCatalogState decision={decision} pageLabel={pageLabel} />;
}
