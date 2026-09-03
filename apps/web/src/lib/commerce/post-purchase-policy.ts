export type PostPurchaseCapability = {
  available: boolean;
  href: string | null;
  reason: string;
};

export type PostPurchaseCapabilities = {
  account: PostPurchaseCapability;
  returns: PostPurchaseCapability;
  reviews: PostPurchaseCapability;
  credit: PostPurchaseCapability;
};

export type AuthenticatedShopifyCustomerFacts = {
  authenticated: true;
  reviewEligibility: 'eligible' | 'ineligible' | 'unknown';
  reviewUrl?: string;
  creditAccountAvailable: boolean;
  creditUrl?: string;
};

type CommerceEnvironment = 'local' | 'preview' | 'production';

function safeHttpsUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return null;
    return url.toString();
  } catch {
    return null;
  }
}

function environmentValue(
  environment: Record<string, string | undefined>,
  commerceEnvironment: CommerceEnvironment,
  name: 'ACCOUNT_URL' | 'RETURNS_URL'
): string | undefined {
  if (commerceEnvironment === 'preview') {
    return environment[`SHOPIFY_STAGING_${name}`];
  }
  return environment[`SHOPIFY_${name}`];
}

function linkedCapability(
  value: string | undefined,
  availableReason: string,
  unavailableReason: string
): PostPurchaseCapability {
  const href = safeHttpsUrl(value);
  return href
    ? { available: true, href, reason: availableReason }
    : { available: false, href: null, reason: unavailableReason };
}

export function resolvePostPurchaseCapabilities(
  environment: Record<string, string | undefined>,
  commerceEnvironment: CommerceEnvironment = 'local',
  customerFacts?: AuthenticatedShopifyCustomerFacts
): PostPurchaseCapabilities {
  const account = linkedCapability(
    environmentValue(environment, commerceEnvironment, 'ACCOUNT_URL'),
    'Shopify customer account is the live order-status authority.',
    'Use the secure order-status link in the Shopify confirmation email.'
  );

  const reviews =
    customerFacts?.authenticated === true &&
    customerFacts.reviewEligibility === 'eligible'
      ? linkedCapability(
          customerFacts.reviewUrl,
          'Shopify confirms this delivered order is eligible for review.',
          'Shopify confirmed delivery, but no verified review destination is configured.'
        )
      : {
          available: false,
          href: null,
          reason:
            'Reviews remain unavailable until an authenticated Shopify order confirms delivery.',
        };

  const credit =
    customerFacts?.authenticated === true &&
    customerFacts.creditAccountAvailable === true
      ? linkedCapability(
          customerFacts.creditUrl,
          'Shopify customer account is the CP Credit balance authority.',
          'Shopify confirms a credit account, but no secure account destination is configured.'
        )
      : {
          available: false,
          href: null,
          reason:
            'No CP Credit is shown until authenticated Shopify account truth is available.',
        };

  return {
    account,
    returns: linkedCapability(
      environmentValue(environment, commerceEnvironment, 'RETURNS_URL'),
      'Shopify self-service returns are available.',
      'Self-service returns are not configured. Contact CP support instead.'
    ),
    reviews,
    credit,
  };
}

export const postPurchaseJourney = [
  {
    id: 'confirmed',
    label: 'Confirmed',
    authority: 'Shopify',
    copy: 'Shopify creates the order and sends the CP-branded confirmation.',
  },
  {
    id: 'production',
    label: 'In production',
    authority: 'Shopify + fulfillment provider',
    copy: 'Production is shown only after the provider reports a real accepted job back to Shopify.',
  },
  {
    id: 'dispatched',
    label: 'Dispatched',
    authority: 'Shopify fulfillment',
    copy: 'Carrier and tracking appear only after fulfillment is posted to Shopify, which sends the CP-branded dispatch email.',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    authority: 'Shopify order status',
    copy: 'Delivery and review eligibility depend on Shopify-backed delivery facts, never a local timer.',
  },
  {
    id: 'return-refund',
    label: 'Return or refund',
    authority: 'Shopify',
    copy: 'Requests, decisions, refunds and CP-branded customer notifications remain Shopify-owned.',
  },
] as const;
