import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadVisibility() {
  vi.resetModules();
  return import('../lib/config/product-visibility.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('product release gates', () => {
  it('fails closed when no gates are enabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_SHOW_PRODUCTS', 'false');
    vi.stubEnv('NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS', 'false');
    const visibility = await loadVisibility();
    expect(visibility.canRenderProducts()).toBe(false);
    expect(visibility.canRenderDraftProductPreviews()).toBe(false);
  });

  it('does not expose draft products through the draft flag alone', async () => {
    vi.stubEnv('NEXT_PUBLIC_SHOW_PRODUCTS', 'false');
    vi.stubEnv('NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS', 'true');
    const visibility = await loadVisibility();
    expect(visibility.canRenderDraftProductPreviews()).toBe(false);
  });

  it('shows the draft preview only when both gates are explicitly enabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_COMMERCE_ENVIRONMENT', 'local');
    vi.stubEnv('NEXT_PUBLIC_SHOW_PRODUCTS', 'true');
    vi.stubEnv('NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS', 'true');
    const visibility = await loadVisibility();
    expect(visibility.canRenderProducts()).toBe(true);
    expect(visibility.canRenderDraftProductPreviews()).toBe(true);
  });

  it.each(['preview', 'production'])(
    'blocks fixture previews in %s',
    async (environment) => {
      vi.stubEnv('NEXT_PUBLIC_COMMERCE_ENVIRONMENT', environment);
      vi.stubEnv('NEXT_PUBLIC_SHOW_PRODUCTS', 'true');
      vi.stubEnv('NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS', 'true');
      const visibility = await loadVisibility();
      expect(visibility.canUseFixtureData()).toBe(false);
      expect(visibility.canRenderDraftProductPreviews()).toBe(false);
    }
  );
});
