import HomeStorefront from '@/components/editorial/HomeStorefront';
import { getServerCatalogDecision } from '@/lib/commerce/catalog-server';
import {
  toHomeCatalogSummary,
  toPreviewJourneyProjection,
} from '@/lib/commerce/home-catalog-summary';
import { getApprovedCampaignAsset } from '@/lib/media/campaign-registry';
import type {
  CatalogDecision,
  HomeCatalogSummary,
  PreviewJourneyProjection,
} from '@/types';

const loadCatalogDecision =
  getServerCatalogDecision as () => Promise<CatalogDecision>;
const summarizeCatalog = toHomeCatalogSummary as (
  decision: CatalogDecision
) => HomeCatalogSummary;
const projectPreviewJourney = toPreviewJourneyProjection as (
  decision: CatalogDecision
) => PreviewJourneyProjection | null;

export const dynamic = 'force-dynamic';

export default async function HomeRoute() {
  const catalogDecision = await loadCatalogDecision();
  return (
    <HomeStorefront
      campaignAsset={getApprovedCampaignAsset(
        'at-edge-of-life-lofoten-runway-hero'
      )}
      catalogSummary={summarizeCatalog(catalogDecision)}
      previewJourney={projectPreviewJourney(catalogDecision)}
    />
  );
}
