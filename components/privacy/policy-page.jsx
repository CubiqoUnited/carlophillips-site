import { StorefrontHeader } from '@/components/storefront/storefront-header';

export function PolicyPage({ eyebrow, title, reviewNote, children }) {
  return (
    <div className="cp-site cp-policy-shell">
      <StorefrontHeader pageLabel={eyebrow} navigationAriaLabel="Policy navigation" />
      <main id="main-content" className="cp-policy-main">
        <p className="cp-policy-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <aside className="cp-policy-review" aria-label="Content review status">{reviewNote}</aside>
        <div className="cp-policy-content">{children}</div>
      </main>
    </div>
  );
}
