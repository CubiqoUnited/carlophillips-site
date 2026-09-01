/*
 * Screens 13 / 26 (support) and 16–18 / 28 (private list) share one intake contract.
 *
 * Validation is pure and shared by the client form and the API route, so the browser and the server
 * agree on what "complete" means. Delivery is deliberately separate: a request is only ever reported
 * as sent when a destination is actually configured and accepted it.
 */

export const INTAKE_STATUS = Object.freeze({
  idle: 'idle',
  invalid: 'invalid',
  sending: 'sending',
  sent: 'sent',
  alreadyRegistered: 'already-registered',
  unavailable: 'unavailable',
});

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateSupportRequest(request) {
  const missing = [];
  if (!String(request?.name || '').trim()) missing.push('name');
  if (!EMAIL_PATTERN.test(String(request?.email || '').trim())) missing.push('email');
  if (!String(request?.message || '').trim()) missing.push('message');
  return { valid: missing.length === 0, missing };
}

export function validateEmailSignup(email) {
  return EMAIL_PATTERN.test(String(email || '').trim());
}

export function supportDestination(env = process.env) {
  const webhook = String(env.CP_SUPPORT_WEBHOOK_URL || '').trim();
  return webhook.startsWith('https://') ? webhook : null;
}

export function privateListDestination(env = process.env) {
  const webhook = String(env.CP_PRIVATE_LIST_WEBHOOK_URL || '').trim();
  return webhook.startsWith('https://') ? webhook : null;
}
