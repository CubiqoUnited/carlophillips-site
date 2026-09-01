/*
 * Screen 12 — Confirmation Email.
 *
 * A transactional email cannot load the site stylesheet, so this is the one place where the
 * CARLOPHILLIPS presentation values are restated as literals. They are derived from the same
 * canonical primitives as `app/design-tokens.css` and are bound back to that file by
 * `tests/order-confirmation-email.test.js`, so the email cannot drift into a second theme.
 */
export const EMAIL_PALETTE = Object.freeze({
  canvas: '#020202',
  panel: '#050505',
  ink: '#ffffff',
  copy: 'rgba(255,255,255,0.66)',
  muted: 'rgba(255,255,255,0.48)',
  rule: 'rgba(255,255,255,0.10)',
});

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount) || 0);
}

function lineRow(line) {
  return `
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid ${EMAIL_PALETTE.rule};">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${EMAIL_PALETTE.ink};">${escapeHtml(line.title)}</div>
              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL_PALETTE.muted};padding-top:6px;">Size ${escapeHtml(line.size)} · ${escapeHtml(line.color)} · Qty ${escapeHtml(line.quantity)}</div>
            </td>
            <td align="right" style="padding:16px 0;border-bottom:1px solid ${EMAIL_PALETTE.rule};font-size:12px;color:${EMAIL_PALETTE.ink};white-space:nowrap;">
              ${escapeHtml(formatMoney(line.unitPrice * line.quantity, line.currency))}
            </td>
          </tr>`;
}

function totalRow(label, value, emphasis = false) {
  const color = emphasis ? EMAIL_PALETTE.ink : EMAIL_PALETTE.copy;
  const size = emphasis ? '14px' : '11px';
  return `
          <tr>
            <td style="padding:6px 0;font-size:${size};letter-spacing:0.16em;text-transform:uppercase;color:${color};">${escapeHtml(label)}</td>
            <td align="right" style="padding:6px 0;font-size:${size};color:${color};white-space:nowrap;">${escapeHtml(value)}</td>
          </tr>`;
}

export function renderOrderConfirmationEmail({
  baseUrl = 'https://www.carlophillips.com',
  currency = 'EUR',
  deliveryEstimate = '3–5 business days',
  lines = [],
  orderReference,
  shippingAddress = null,
  shipping = 0,
  subtotal = 0,
  total = 0,
}) {
  const orderUrl = `${baseUrl}/track?order=${encodeURIComponent(orderReference)}`;
  const address = shippingAddress
    ? [shippingAddress.name, shippingAddress.address, `${shippingAddress.postalCode || ''} ${shippingAddress.city || ''}`.trim(), shippingAddress.country]
      .filter(Boolean)
      .map(part => `<div style="font-size:11px;letter-spacing:0.12em;color:${EMAIL_PALETTE.copy};padding-top:4px;">${escapeHtml(part)}</div>`)
      .join('')
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Order #${escapeHtml(orderReference)} is confirmed</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_PALETTE.canvas};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_PALETTE.canvas};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:${EMAIL_PALETTE.panel};">
          <tr>
            <td align="center" style="padding:28px 32px;border-bottom:1px solid ${EMAIL_PALETTE.rule};font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.32em;color:${EMAIL_PALETTE.ink};">
              CARLOPHILLIPS
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-family:Helvetica,Arial,sans-serif;">
              <div style="font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${EMAIL_PALETTE.muted};">Thank you for your order</div>
              <h1 style="margin:12px 0 0;font-size:24px;line-height:1.2;font-weight:400;color:${EMAIL_PALETTE.ink};">Order #${escapeHtml(orderReference)} is confirmed</h1>
              <p style="margin:12px 0 0;font-size:12px;line-height:1.7;color:${EMAIL_PALETTE.copy};">
                We are preparing your piece now. You will receive a second email the moment your order ships, with tracking included.
              </p>

              <div style="margin-top:28px;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${EMAIL_PALETTE.muted};">Order summary</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">${lines.map(lineRow).join('')}
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${totalRow('Subtotal', formatMoney(subtotal, currency))}${totalRow('Shipping', formatMoney(shipping, currency))}${totalRow('Total', formatMoney(total, currency), true)}
              </table>

              ${address ? `<div style="margin-top:28px;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${EMAIL_PALETTE.muted};">Shipping address</div>${address}` : ''}

              <div style="margin-top:24px;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${EMAIL_PALETTE.muted};">Estimated delivery</div>
              <div style="font-size:11px;letter-spacing:0.12em;color:${EMAIL_PALETTE.copy};padding-top:4px;">${escapeHtml(deliveryEstimate)}</div>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center" style="background:${EMAIL_PALETTE.ink};">
                    <a href="${escapeHtml(orderUrl)}" style="display:inline-block;padding:14px 32px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:${EMAIL_PALETTE.canvas};text-decoration:none;">View your order</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 32px 32px;border-top:1px solid ${EMAIL_PALETTE.rule};font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${EMAIL_PALETTE.muted};">
              <a href="${escapeHtml(orderUrl)}" style="color:${EMAIL_PALETTE.muted};text-decoration:none;">Track order</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(`${baseUrl}/contact`)}" style="color:${EMAIL_PALETTE.muted};text-decoration:none;">Contact support</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(`${baseUrl}/terms`)}" style="color:${EMAIL_PALETTE.muted};text-decoration:none;">Returns</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
