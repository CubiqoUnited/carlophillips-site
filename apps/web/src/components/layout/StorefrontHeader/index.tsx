import Link from 'next/link';
import React from 'react';

export function StorefrontHeader({
  pageLabel,
  navigationAriaLabel = 'Storefront navigation',
  fixed = false,
}: {
  pageLabel?: string;
  navigationAriaLabel?: string;
  fixed?: boolean;
}) {
  return (
    <header
      className={`cp-commerce-header ${fixed ? 'cp-commerce-header-fixed' : ''}`}
    >
      <div className="cp-commerce-header-inner">
        <Link href="/" className="cp-commerce-brand">
          CARLOPHILLIPS
        </Link>
        <nav className="cp-commerce-nav" aria-label={navigationAriaLabel}>
          {pageLabel === 'Collection' ||
          !pageLabel ||
          pageLabel === 'Bag' ||
          pageLabel === 'Member' ? (
            pageLabel === 'Collection' ? (
              <span aria-current="page">Collection</span>
            ) : (
              <Link href="/shop">Collection</Link>
            )
          ) : (
            <span aria-current="page">{pageLabel}</span>
          )}
          {pageLabel === 'Member' ? (
            <span aria-current="page">Member</span>
          ) : (
            <Link href="/member">Member</Link>
          )}
          {pageLabel === 'Bag' ? (
            <span aria-current="page">Bag</span>
          ) : (
            <Link href="/bag">Bag</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
