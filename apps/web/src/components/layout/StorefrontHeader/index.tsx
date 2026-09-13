
'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useModalDialog } from '@/lib/a11y/use-modal-dialog';
import {
  resolveStorefrontMenuCategories,
  STOREFRONT_MENU_ALL_CATEGORIES,
  STOREFRONT_MENU_HOME,
  STOREFRONT_MENU_SUPPORT_LINKS,
} from '@/lib/navigation/storefront-menu';

export function StorefrontHeader({
  pageLabel,
  navigationAriaLabel = 'Storefront navigation',
  fixed = false,
  bagCount = 0,
  categories = [],
}: {
  pageLabel?: string;
  navigationAriaLabel?: string;
  fixed?: boolean;
  bagCount?: number;
  categories?: Array<{ label: string; href: string; key?: string }>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentBagCount, setCurrentBagCount] = useState(bagCount);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuCategories = resolveStorefrontMenuCategories(categories);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/cart', { signal: controller.signal, cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (typeof result?.count === 'number') setCurrentBagCount(result.count);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const updateCount = (event: Event) => {
      const count = (event as CustomEvent<{ count?: number }>).detail?.count;
      if (typeof count === 'number') setCurrentBagCount(count);
    };
    window.addEventListener('cp:bag-count', updateCount);
    return () => window.removeEventListener('cp:bag-count', updateCount);
  }, []);
  useModalDialog(menuOpen, menuRef, triggerRef, () => setMenuOpen(false));
  return (
    <header
      className={`cp-commerce-header ${fixed ? 'cp-commerce-header-fixed' : ''}`}
    >
      <div className="cp-commerce-header-inner">
        <button
          ref={triggerRef}
          type="button"
          className="cp-commerce-menu-trigger"
          aria-expanded={menuOpen}
          aria-controls="storefront-mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          ☰ <span>Menu</span>
        </button>
        <Link href="/" className="cp-commerce-brand">
          CARLOPHILLIPS
        </Link>
        <nav className="cp-commerce-nav" aria-label={navigationAriaLabel}>
          {pageLabel === 'Shop' ? (
            <span aria-current="page">Shop</span>
          ) : (
            <Link href="/shop">Shop</Link>
          )}
          {pageLabel === 'Aftercare' ? (
            <span aria-current="page">Aftercare</span>
          ) : (
            <Link href="/aftercare">Aftercare</Link>
          )}
          {pageLabel === 'Bag' ? (
            <Link href="/bag" aria-current="page">
              Bag ({currentBagCount})
            </Link>
          ) : (
            <Link href="/bag">Bag ({currentBagCount})</Link>
          )}
        </nav>
        <Link href="/bag" className="cp-commerce-mobile-bag">
          Bag ({currentBagCount})
        </Link>
      </div>
      {menuOpen && (
        <div
          className="cp-modal-backdrop"
          onMouseDown={() => setMenuOpen(false)}
        >
          <div
            id="storefront-mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="cp-mobile-menu"
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cp-mobile-menu-header">
              <span>Menu</span>
              <button
                type="button"
                className="cp-icon-action"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
            </div>
            <nav aria-label="Mobile storefront navigation">
              <p className="cp-mobile-menu-label">Explore</p>
              <Link
                href={STOREFRONT_MENU_HOME.href}
                onClick={() => setMenuOpen(false)}
              >
                {STOREFRONT_MENU_HOME.label}
              </Link>
              <Link
                href={STOREFRONT_MENU_ALL_CATEGORIES.href}
                onClick={() => setMenuOpen(false)}
              >
                {STOREFRONT_MENU_ALL_CATEGORIES.label}
              </Link>
              {menuCategories.map((category) => (
                <Link
                  key={category.key}
                  href={category.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {category.label}
                </Link>
              ))}
              <p className="cp-mobile-menu-label">Customer care</p>
              {STOREFRONT_MENU_SUPPORT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
