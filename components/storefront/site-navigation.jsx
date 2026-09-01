'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { lockDocumentScroll, moveDialogFocus, dialogFocusableSelector } from './dialog-lifecycle.js';

/*
 * Screen 21 — Menu / Navigation. The workbook fixes both the entries and their order, and requires
 * the footnote that explains where CONTACT US leads. Entries that open an overlay on the discovery
 * page fall back to their own route everywhere else, so the menu is complete from any surface.
 */
export const NAVIGATION_ENTRIES = Object.freeze([
  Object.freeze({ id: 'discovery', label: 'Discovery', href: '/' }),
  Object.freeze({ id: 'all-categories', label: 'All categories', href: '/collections' }),
  Object.freeze({ id: 'all-hoodies', label: 'All hoodies', href: '/shop' }),
  Object.freeze({ id: 'contact-us', label: 'Contact us', href: '/contact' }),
  Object.freeze({ id: 'private-list', label: 'Private list', href: '/private-list' }),
]);

export function SiteHeader({
  bagCount = 0,
  menuButtonRef = null,
  menuOpen = false,
  onBag = null,
  onJoinList = null,
  onMenu,
  showJoinList = false,
}) {
  return (
    <header className="cp-site-header">
      <div className="cp-site-header-inner cp-page-shell">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenu}
          className="cp-nav-action cp-nav-action-start"
          aria-label="Open navigation"
          aria-controls="site-menu-overlay"
          aria-expanded={menuOpen}
        >
          <Menu className="cp-icon cp-icon-small" />
          <span className="cp-nav-label">Menu</span>
        </button>
        <Link href="/" className="cp-wordmark">CARLOPHILLIPS</Link>
        <div className="cp-nav-action-group">
          {showJoinList && (
            onJoinList
              ? <button type="button" onClick={onJoinList} className="cp-nav-join">Join the list</button>
              : <Link href="/private-list" className="cp-nav-join">Join the list</Link>
          )}
          {onBag ? (
            <button type="button" onClick={onBag} className="cp-nav-action cp-nav-action-end" aria-label="Bag">
              <span className="cp-nav-label">Bag</span>
              {bagCount > 0 && <span className="cp-nav-bag-count">{bagCount}</span>}
              <ShoppingBag className="cp-icon cp-icon-small" />
            </button>
          ) : (
            <Link href="/bag" className="cp-nav-action cp-nav-action-end" aria-label="Bag">
              <span className="cp-nav-label">Bag</span>
              {bagCount > 0 && <span className="cp-nav-bag-count">{bagCount}</span>}
              <ShoppingBag className="cp-icon cp-icon-small" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function MenuOverlay({ activeId = null, onClose, onSelect = null }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const releaseDocumentScroll = lockDocumentScroll();
    const focusDialog = window.requestAnimationFrame(() => {
      dialog?.querySelector(dialogFocusableSelector)?.focus();
    });

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      moveDialogFocus(event, dialog);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusDialog);
      window.removeEventListener('keydown', handleKeyDown);
      releaseDocumentScroll();
    };
  }, [onClose]);

  return (
    <aside
      id="site-menu-overlay"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-menu-title"
      className="cp-menu-overlay"
    >
      <div className="cp-menu-panel">
        <div className="cp-menu-bar">
          <span id="site-menu-title" className="cp-menu-title">Navigation</span>
          <button type="button" onClick={onClose} className="cp-menu-close" aria-label="Close navigation">
            <X className="cp-icon cp-icon-medium" />
          </button>
        </div>
        <nav className="cp-menu-links" aria-label="Main menu">
          {NAVIGATION_ENTRIES.map(entry => {
            const handled = onSelect ? onSelect(entry) : null;
            const className = activeId === entry.id ? 'cp-menu-link cp-menu-link-active' : 'cp-menu-link';
            return handled
              ? <button key={entry.id} type="button" className={className} onClick={handled}>{entry.label}</button>
              : <Link key={entry.id} href={entry.href} className={className} onClick={onClose}>{entry.label}</Link>;
          })}
        </nav>
        <p className="cp-menu-footnote">Contact us opens the Support form.</p>
      </div>
    </aside>
  );
}
