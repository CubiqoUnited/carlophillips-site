'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

export function StorefrontHeader({
  pageLabel,
  navigationAriaLabel = 'Storefront navigation',
  fixed = false,
}: {
  pageLabel?: string;
  navigationAriaLabel?: string;
  fixed?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);
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
            <span aria-current="page">Bag</span>
          ) : (
            <Link href="/bag">Bag</Link>
          )}
        </nav>
        <Link href="/bag" className="cp-commerce-mobile-bag">
          Bag
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
              <Link href="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link href="/shop" onClick={() => setMenuOpen(false)}>
                Shop
              </Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
              <Link href="/aftercare" onClick={() => setMenuOpen(false)}>
                Aftercare
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
