import 'server-only';

import type { SupportRequest, SupportTopic } from './contact-intake';

type SupportEnvironment = Readonly<Record<string, string | undefined>>;

type SupportDeliveryResult =
  | { delivered: true; requestId: string }
  | {
      delivered: false;
      reason: 'not-configured' | 'provider-rejected' | 'provider-unavailable';
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const topicLabels: Record<SupportTopic, string> = {
  'order-status': 'Order status',
  'shipping-delivery': 'Shipping and delivery',
  'return-exchange': 'Return or exchange',
  'cancellation-refund': 'Cancellation or refund',
  'product-fit': 'Product and fit',
  'payment-checkout': 'Payment or checkout',
  other: 'Other',
};

function configuredEmail(value: string | undefined): string | null {
  const candidate = value?.trim() || '';
  return EMAIL_PATTERN.test(candidate) && candidate.length <= 254
    ? candidate
    : null;
}

export function resolveSupportDeliveryConfig(environment: SupportEnvironment) {
  const apiKey = environment.RESEND_API_KEY?.trim() || '';
  const from = configuredEmail(environment.CP_SUPPORT_FROM_EMAIL);
  const to = configuredEmail(environment.CP_SUPPORT_TO_EMAIL);
  if (!apiKey || !from || !to) return null;
  return { apiKey, from, to };
}

function supportText(requestId: string, request: SupportRequest): string {
  return [
    `CARLOPHILLIPS support request ${requestId}`,
    `Topic: ${topicLabels[request.topic]}`,
    `Customer reply email: ${request.email}`,
    request.orderNumber ? `Order reference: ${request.orderNumber}` : null,
    '',
    request.message,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

export async function deliverSupportRequest(
  request: SupportRequest,
  environment: SupportEnvironment = process.env,
  fetcher: typeof fetch = fetch
): Promise<SupportDeliveryResult> {
  const config = resolveSupportDeliveryConfig(environment);
  if (!config) return { delivered: false, reason: 'not-configured' };

  const requestId = `CP-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
  try {
    const response = await fetcher(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: `CARLOPHILLIPS <${config.from}>`,
        to: [config.to],
        reply_to: request.email,
        subject: `CARLOPHILLIPS support — ${topicLabels[request.topic]}`,
        text: supportText(requestId, request),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return { delivered: false, reason: 'provider-rejected' };
    }
    return { delivered: true, requestId };
  } catch {
    return { delivered: false, reason: 'provider-unavailable' };
  }
}
