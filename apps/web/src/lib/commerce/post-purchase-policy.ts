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

function safeHttpsUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
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
  environment: Record<string, string | undefined>
): PostPurchaseCapabilities {
  const account = linkedCapability(
    environment.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL,
    'Shopify customer account is the live order-status authority.',
    'Use the secure order-status link in the Shopify confirmation email.'
  );

  return {
    account,
    returns: linkedCapability(
      environment.NEXT_PUBLIC_SHOPIFY_RETURNS_URL,
      'Shopify self-service returns are available.',
      'Self-service returns are not configured. Contact CP support instead.'
    ),
    reviews: linkedCapability(
      environment.NEXT_PUBLIC_SHOPIFY_REVIEW_URL,
      'Delivered-order review collection is available.',
      'Reviews remain unavailable until a Shopify-backed delivered-order check is configured.'
    ),
    credit:
      environment.NEXT_PUBLIC_SHOPIFY_CREDIT_ENABLED === 'true' &&
      account.available
        ? {
            available: true,
            href: account.href,
            reason:
              'Shopify customer account is the CP Credit balance authority.',
          }
        : {
            available: false,
            href: null,
            reason:
              'No CP Credit balance is shown until Shopify supplies an authenticated balance.',
          },
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
