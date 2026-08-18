export const analyticsEventNames = Object.freeze([
  'page_view',
  'collection_view',
  'product_view',
  'policy_view',
  'consent_update',
]);

const safeProperties = new Set(['route_group', 'viewport_class', 'consent_choice']);

export function createAnalyticsEvent(name, properties = {}) {
  if (!analyticsEventNames.includes(name)) throw new Error('Unsupported analytics event');
  const sanitized = Object.fromEntries(Object.entries(properties).filter(([key, value]) => safeProperties.has(key) && typeof value === 'string'));
  return { name, properties: sanitized };
}
