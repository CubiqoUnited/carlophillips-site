import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '/Users/edv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const productionUrl = 'https://www.carlophillips.com';
const previewUrl = 'https://carlophillips-site-l1zq41yzo-adityas-projects-261b17a9.vercel.app';
const previewHead = '55604acb90878a6973c8c13524608c2191577b64';
const evidenceRoot = 'test_reports/cp-v1.2.2-production-parity-correction-2026-08-14';
const screenshotRoot = `${evidenceRoot}/screenshots`;
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const candidateCss = `${readFileSync('app/design-tokens.css', 'utf8')}\n${readFileSync('app/globals.css', 'utf8').replace(/^@import[^;]+;\s*/, '')}`;

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'compact', width: 584, height: 486 },
  { name: 'mobile', width: 390, height: 844 },
];

const roleSpecs = {
  home: [
    { role: 'product-facts', production: { selector: '.cp-product-facts' }, candidate: '.cp-product-facts' },
    { role: 'product-fact', production: { selector: '.cp-product-facts li' }, candidate: '.cp-product-facts li' },
  ],
  shop: [
    { role: 'commerce-body', production: { tag: 'p', startsWith: 'One essential.' }, candidate: '.cp-catalog-intro' },
    { role: 'card-label', production: { tag: 'p', startsWith: 'Edition 001' }, candidate: '.cp-card-copy > .cp-label-small' },
    { role: 'card-title', production: { tag: 'h2', startsWith: 'CARLOPHILLIPS Signature Hoodie' }, candidate: '.cp-card-title' },
    { role: 'card-action', production: { tag: 'a', startsWith: 'View product' }, candidate: '.cp-card-action' },
  ],
  pdp: [
    { role: 'pdp-price', production: { tag: 'p', exact: '$128' }, candidate: '.cp-product-detail-price' },
    { role: 'pdp-description', production: { tag: 'p', startsWith: 'Heavyweight black pullover hoodie' }, candidate: '.cp-product-detail-description' },
    { role: 'checkout-label', production: { tag: 'label', startsWith: 'Select size' }, candidate: '.cp-checkout-label' },
    { role: 'checkout-select', production: { selector: 'select' }, candidate: '.cp-checkout-select' },
    { role: 'checkout-action', production: { tag: 'button', startsWith: 'Continue to checkout' }, candidate: '.cp-checkout-action' },
    { role: 'checkout-explanation', production: { tag: 'p', startsWith: 'Review delivery and payment' }, candidate: '.cp-checkout-explanation' },
    { role: 'information-section', production: { sectionHeading: 'Made to be lived in.' }, candidate: '.cp-information-section' },
    { role: 'information-title', production: { tag: 'h2', startsWith: 'Made to be lived in.' }, candidate: '.cp-information-title' },
    { role: 'information-copy', production: { tag: 'p', startsWith: 'Heavyweight black pullover hoodie', withinHeading: 'Made to be lived in.' }, candidate: '.cp-information-copy' },
    { role: 'information-label', production: { tag: 'p', exact: 'Colour' }, candidate: '.cp-information-fact-label' },
    { role: 'editorial-title', production: { tag: 'h2', startsWith: 'A study in weight' }, candidate: '.cp-editorial-title' },
    { role: 'editorial-copy', production: { tag: 'p', startsWith: 'Digital campaign studies', withinHeading: 'A study in weight' }, candidate: '.cp-editorial-copy' },
  ],
  bag: [
    { role: 'bag-primary-action', production: { tag: 'a', startsWith: 'View release state' }, candidate: '.cp-bag-actions .cp-action:first-child' },
    { role: 'bag-secondary-action', production: { tag: 'a', startsWith: 'Return home' }, candidate: '.cp-bag-actions .cp-action:last-child' },
  ],
};

const comparisons = [
  ['product-facts', ['height']],
  ['product-fact', ['fontSize', 'lineHeight', 'letterSpacing', 'height']],
  ['commerce-body', ['fontSize', 'lineHeight']],
  ['card-label', ['fontSize', 'lineHeight']],
  ['card-title', ['letterSpacing']],
  ['card-action', ['fontSize', 'lineHeight', 'letterSpacing', 'height', 'paddingInlineStart', 'paddingInlineEnd']],
  ['pdp-price', ['lineHeight', 'height', 'documentY']],
  ['pdp-description', ['fontSize', 'lineHeight', 'height', 'documentY']],
  ['checkout-label', ['fontSize', 'lineHeight', 'letterSpacing', 'documentY']],
  ['checkout-select', ['height', 'documentY']],
  ['checkout-action', ['fontSize', 'lineHeight', 'letterSpacing', 'height', 'documentY']],
  ['checkout-explanation', ['fontSize', 'lineHeight', 'height', 'documentY']],
  ['information-section', ['height', 'paddingTop', 'paddingBottom']],
  ['information-title', ['fontSize', 'lineHeight', 'letterSpacing', 'width', 'lineCount', 'documentY']],
  ['information-copy', ['fontSize', 'lineHeight', 'height', 'documentY']],
  ['information-label', ['fontSize']],
  ['editorial-title', ['fontSize', 'lineHeight', 'letterSpacing', 'width', 'lineCount', 'documentY']],
  ['editorial-copy', ['fontSize', 'lineHeight', 'height', 'documentY']],
  ['bag-primary-action', ['fontSize', 'lineHeight', 'letterSpacing', 'width', 'paddingInlineStart', 'paddingInlineEnd']],
  ['bag-secondary-action', ['fontSize', 'lineHeight', 'letterSpacing', 'width', 'paddingInlineStart', 'paddingInlineEnd']],
];

const screenshotStates = [
  { name: 'home-hero', path: '/', target: null },
  { name: 'home-one', path: '/', target: '#signature-runway' },
  { name: 'home-overlay', path: '/', target: '#signature-runway', overlay: true },
  { name: 'shop', path: '/shop', targetText: ['h2', 'CARLOPHILLIPS Signature Hoodie'] },
  { name: 'pdp', path: '/products/carlophillips-signature-hoodie', target: null },
  { name: 'pdp-information', path: '/products/carlophillips-signature-hoodie', targetText: ['h2', 'Made to be lived in.'] },
  { name: 'pdp-editorial', path: '/products/carlophillips-signature-hoodie', targetText: ['h2', 'A study in weight'] },
  { name: 'bag', path: '/bag', target: null },
];

function roleMap(entries) {
  return Object.fromEntries(entries.map(entry => [entry.role, entry]));
}

function numericEquivalent(left, right) {
  if (typeof left !== 'number' || typeof right !== 'number') return left === right;
  return Math.abs(left - right) <= 0.02;
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    const loadedOrVisible = [...document.images].filter(image => {
      const rect = image.getBoundingClientRect();
      return image.complete || (rect.bottom >= 0 && rect.top <= window.innerHeight);
    });
    await Promise.race([
      Promise.all(loadedOrVisible.map(image => image.decode?.().catch(() => {}))),
      new Promise(resolve => setTimeout(resolve, 2000)),
    ]);
  });
  await page.waitForTimeout(150);
}

async function open(page, url) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await settle(page);
  if (!response || response.status() !== 200) throw new Error(`Expected 200 from ${url}; received ${response?.status()}`);
}

async function injectCandidateCss(page) {
  await page.addStyleTag({ content: candidateCss });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
}

async function collectMetrics(page, specs, mode) {
  return page.evaluate(({ specs: serialized, mode: currentMode }) => {
    const resolveProduction = locator => {
      if (locator.selector) return document.querySelector(locator.selector);
      const section = locator.withinHeading || locator.sectionHeading
        ? [...document.querySelectorAll('section')].find(candidate =>
          [...candidate.querySelectorAll('h1, h2, h3')].some(heading => heading.textContent.trim().startsWith(locator.withinHeading || locator.sectionHeading)))
        : document;
      if (locator.sectionHeading) return section || null;
      const elements = [...section.querySelectorAll(locator.tag)];
      if (locator.exact) return elements.find(element => element.textContent.trim() === locator.exact) || null;
      return elements.find(element => element.textContent.trim().startsWith(locator.startsWith)) || null;
    };
    const metric = element => {
      if (!element) return null;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const lineHeight = Number.parseFloat(style.lineHeight);
      return {
        text: element.textContent.trim().replace(/\s+/g, ' '),
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        width: rect.width,
        height: rect.height,
        documentX: rect.x + window.scrollX,
        documentY: rect.y + window.scrollY,
        paddingInlineStart: style.paddingInlineStart,
        paddingInlineEnd: style.paddingInlineEnd,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        lineCount: Number.isFinite(lineHeight) && lineHeight > 0 ? Math.round(rect.height / lineHeight) : null,
      };
    };
    return serialized.map(spec => ({
      role: spec.role,
      metric: metric(currentMode === 'production' ? resolveProduction(spec.production) : document.querySelector(spec.candidate)),
    }));
  }, { specs, mode });
}

async function health(page) {
  return page.evaluate(() => ({
    frameworkOverlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc || image.src),
    brokenVideos: [...document.querySelectorAll('video')].filter(video => video.error).map(video => video.currentSrc || video.src),
  }));
}

async function prepareScreenshot(page, state) {
  let target = null;
  if (state.target) {
    target = page.locator(state.target);
  } else if (state.targetText) {
    const [tag, text] = state.targetText;
    target = page.locator(tag).filter({ hasText: text }).first();
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  if (target) {
    await page.evaluate(async () => {
      const step = Math.max(240, Math.floor(window.innerHeight * 0.8));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      await Promise.race([
        Promise.all([...document.images].map(image => image.decode?.().catch(() => {}))),
        new Promise(resolve => setTimeout(resolve, 5000)),
      ]);
    });
    await target.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest' }));
    await page.waitForTimeout(300);
  }
  await page.evaluate(async () => {
    const visible = [...document.images].filter(image => {
      const rect = image.getBoundingClientRect();
      return rect.bottom >= 0 && rect.top <= window.innerHeight;
    });
    await Promise.race([
      Promise.all(visible.map(image => image.decode?.().catch(() => {}))),
      new Promise(resolve => setTimeout(resolve, 2000)),
    ]);
  });
  if (state.overlay) {
    await page.getByRole('button', { name: /Explore media/i }).click();
    await page.locator('[role="dialog"]').waitFor({ state: 'visible' });
    await page.waitForTimeout(100);
  }
}

mkdirSync(`${screenshotRoot}/production`, { recursive: true });
mkdirSync(`${screenshotRoot}/candidate`, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--disable-background-networking', '--disable-default-apps', '--no-first-run'],
});

const report = {
  schemaVersion: 'cp.production-parity-correction.v1',
  date: '2026-08-14',
  method: 'headless background Chrome; candidate is exact PR #9 Preview DOM with worktree CSS injected ephemerally',
  productionUrl,
  previewUrl,
  previewHead,
  externalMutation: false,
  viewports: [],
  screenshotStates: screenshotStates.map(state => state.name),
  checks: [],
};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      hasTouch: viewport.name === 'mobile',
    });
    const production = await context.newPage();
    const candidate = await context.newPage();
    const productionErrors = [];
    const candidateErrors = [];
    production.on('console', message => { if (message.type() === 'error') productionErrors.push(message.text()); });
    production.on('pageerror', error => productionErrors.push(error.message));
    candidate.on('console', message => { if (message.type() === 'error') candidateErrors.push(message.text()); });
    candidate.on('pageerror', error => candidateErrors.push(error.message));

    const metrics = {};
    for (const [route, path] of Object.entries({ home: '/', shop: '/shop', pdp: '/products/carlophillips-signature-hoodie', bag: '/bag' })) {
      await open(production, `${productionUrl}${path}`);
      await open(candidate, `${previewUrl}${path}`);
      const productionMetrics = await collectMetrics(production, roleSpecs[route], 'production');
      const previewMetrics = await collectMetrics(candidate, roleSpecs[route], 'candidate');
      await injectCandidateCss(candidate);
      const candidateMetrics = await collectMetrics(candidate, roleSpecs[route], 'candidate');
      metrics[route] = { production: productionMetrics, previewHeadBeforeCorrection: previewMetrics, candidate: candidateMetrics };
    }

    for (const state of screenshotStates) {
      await open(production, `${productionUrl}${state.path}`);
      await prepareScreenshot(production, state);
      await production.screenshot({ path: `${screenshotRoot}/production/${viewport.name}-${state.name}.png` });

      await open(candidate, `${previewUrl}${state.path}`);
      await injectCandidateCss(candidate);
      await prepareScreenshot(candidate, state);
      await candidate.screenshot({ path: `${screenshotRoot}/candidate/${viewport.name}-${state.name}.png` });
    }

    const flatProduction = roleMap(Object.values(metrics).flatMap(route => route.production));
    const flatCandidate = roleMap(Object.values(metrics).flatMap(route => route.candidate));
    for (const [role, properties] of comparisons) {
      for (const property of properties) {
        const productionValue = flatProduction[role]?.metric?.[property];
        const candidateValue = flatCandidate[role]?.metric?.[property];
        report.checks.push({
          viewport: viewport.name,
          role,
          property,
          production: productionValue,
          candidate: candidateValue,
          pass: productionValue != null && candidateValue != null && numericEquivalent(productionValue, candidateValue),
        });
      }
    }

    report.viewports.push({
      ...viewport,
      metrics,
      productionHealth: await health(production),
      candidateHealth: await health(candidate),
      productionErrors,
      candidateErrors,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

report.summary = {
  totalChecks: report.checks.length,
  passedChecks: report.checks.filter(check => check.pass).length,
  failedChecks: report.checks.filter(check => !check.pass),
  allRoleChecksPassed: report.checks.every(check => check.pass),
  allPagesHealthy: report.viewports.every(viewport =>
    !viewport.productionHealth.frameworkOverlay
    && !viewport.candidateHealth.frameworkOverlay
    && !viewport.productionHealth.horizontalOverflow
    && !viewport.candidateHealth.horizontalOverflow
    && viewport.productionHealth.brokenImages.length === 0
    && viewport.candidateHealth.brokenImages.length === 0
    && viewport.productionHealth.brokenVideos.length === 0
    && viewport.candidateHealth.brokenVideos.length === 0
    && viewport.productionErrors.length === 0
    && viewport.candidateErrors.length === 0),
};

writeFileSync(`${evidenceRoot}/production-comparison.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
