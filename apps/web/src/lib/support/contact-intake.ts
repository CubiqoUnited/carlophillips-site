export const SUPPORT_TOPICS = [
  'order-status',
  'shipping-delivery',
  'return-exchange',
  'cancellation-refund',
  'product-fit',
  'payment-checkout',
  'other',
] as const;

export type SupportTopic = (typeof SUPPORT_TOPICS)[number];

export type SupportRequest = {
  email: string;
  topic: SupportTopic;
  orderNumber: string;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ORDER_PATTERN = /^[A-Za-z0-9#_-]{0,48}$/;

function clean(value: unknown): string {
  return String(value || '').trim();
}

export function validateSupportRequest(
  input: Record<string, unknown>
):
  | { valid: true; fields: []; request: SupportRequest }
  | { valid: false; fields: string[]; request: null } {
  const fields: string[] = [];
  const email = clean(input.email);
  const topic = clean(input.topic);
  const orderNumber = clean(input.orderNumber);
  const message = clean(input.message);

  if (!EMAIL_PATTERN.test(email) || email.length > 254) fields.push('email');
  if (!SUPPORT_TOPICS.includes(topic as (typeof SUPPORT_TOPICS)[number]))
    fields.push('topic');
  if (!ORDER_PATTERN.test(orderNumber)) fields.push('orderNumber');
  if (message.length < 10 || message.length > 4000) fields.push('message');

  if (fields.length > 0) return { valid: false, fields, request: null };
  return {
    valid: true,
    fields: [],
    request: {
      email,
      topic: topic as SupportTopic,
      orderNumber,
      message,
    },
  };
}
