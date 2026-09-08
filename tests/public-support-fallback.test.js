import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  ContactSupportRecovery,
  supportStatusForResponse,
} from '../apps/web/src/components/support/ContactForm';
import { resolvePublicSupportFallback } from '../apps/web/src/lib/support/public-support-fallback';

describe('public support fallback', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns only a dedicated public HTTPS destination', () => {
    expect(
      resolvePublicSupportFallback({
        CP_SUPPORT_PUBLIC_FALLBACK_URL:
          'https://support.carlophillips.example/contact',
      })
    ).toBe('https://support.carlophillips.example/contact');
  });

  it('fails closed when the destination is absent or unsafe', () => {
    expect(resolvePublicSupportFallback({})).toBeNull();
    for (const value of [
      'mailto:private@example.com',
      'http://support.example.com',
      'https://user:secret@support.example.com',
      'https://support.example.com/private?order=secret',
      'https://support.example.com/#token',
      'https://localhost/help',
      'https://127.0.0.1/help',
      'https://support.example.com:8443/help',
      'not a URL',
    ]) {
      expect(
        resolvePublicSupportFallback({
          CP_SUPPORT_PUBLIC_FALLBACK_URL: value,
        })
      ).toBeNull();
    }

    const html = renderToStaticMarkup(
      createElement(ContactSupportRecovery, {
        unavailable: true,
        fallbackHref: null,
      })
    );
    expect(html).toContain('secure order-status link');
    expect(html).not.toContain('Alternate support');
    expect(html).not.toContain('<a');
  });

  it('labels the configured fallback as an alternate public channel', () => {
    const html = renderToStaticMarkup(
      createElement(ContactSupportRecovery, {
        unavailable: false,
        fallbackHref: 'https://support.carlophillips.example/contact',
      })
    );
    expect(html).toContain('Your request was not sent');
    expect(html).toContain('secure order-status link');
    expect(html).toContain('Alternate support');
    expect(html).toContain(
      'href="https://support.carlophillips.example/contact"'
    );
  });

  it('maps both delivery failure responses to truthful retryable states', () => {
    expect(supportStatusForResponse(502)).toBe('failed');
    expect(supportStatusForResponse(503)).toBe('unavailable');
    expect(supportStatusForResponse(400)).toBe('invalid');
  });
});
