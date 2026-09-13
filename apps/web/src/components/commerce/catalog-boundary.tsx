import React from 'react';
import type { CatalogDecision, HomeCatalogSummary } from '@/types';
import { CommerceCatalogState } from './catalog-state';
import { getServerCatalogDecision } from '@/lib/commerce/catalog-server';
import { toHomeCatalogSummary } from '@/lib/commerce/home-catalog-summary';
import { getApprovedCampaignAsset } from '@/lib/media/campaign-registry';
import HomeStorefront from '@/components/editorial/HomeStorefront';

const loadCatalogDecision =
  getServerCatalogDecision as () => Promise<CatalogDecision>;
const summarizeCatalog = toHomeCatalogSummary as (
  decision: CatalogDecision,
  preferredHandle?: string
) => HomeCatalogSummary;

export async function CommerceCatalogBoundary({
  pageLabel,
  discoveryOverlay = false,
  productHandle,
}: {
  pageLabel?: string;
  discoveryOverlay?: boolean;
  productHandle?: string;
}) {
  const decision = await loadCatalogDecision();
  if (productHandle) {
    return (
      <HomeStorefront
        campaignAsset={getApprovedCampaignAsset(
          'at-edge-of-life-lofoten-runway-hero'
        )}
        catalogSummary={summarizeCatalog(decision, productHandle)}
        previewJourney={null}
        discoveryOnly
      />
    );
  }
  if (!discoveryOverlay) {
    return <CommerceCatalogState decision={decision} pageLabel={pageLabel} />;
  }

  return (
    <>
      <div
        className="cp-shop-discovery-background"
        aria-hidden="true"
        inert={true}
      >
        <HomeStorefront
          campaignAsset={getApprovedCampaignAsset(
            'at-edge-of-life-lofoten-runway-hero'
          )}
          catalogSummary={summarizeCatalog(decision)}
          previewJourney={null}
        />
      </div>
      <CommerceCatalogState decision={decision} pageLabel={pageLabel} overlay />
    </>
  );
}
