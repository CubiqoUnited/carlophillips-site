'use client';

import { useEffect } from 'react';

/*
 * Shared dialog behaviour for every overlay, drawer and widget in the workbook: background scroll
 * is locked, background interaction is isolated by the caller's `inert`, Escape closes, Tab is
 * trapped, and focus returns to the opener. Extracted so a new screen cannot ship a dialog that
 * behaves differently from the ones already reviewed.
 */
export const dialogFocusableSelector = 'button:not(:disabled), a[href], input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function lockDocumentScroll() {
  const root = document.documentElement;
  const body = document.body;
  const rootWasLocked = root.classList.contains('cp-scroll-locked');
  const bodyWasLocked = body.classList.contains('cp-scroll-locked');
  const preventScroll = event => event.preventDefault();

  root.classList.add('cp-scroll-locked');
  body.classList.add('cp-scroll-locked');
  window.addEventListener('wheel', preventScroll, { passive: false });

  return () => {
    window.removeEventListener('wheel', preventScroll);
    if (!rootWasLocked) root.classList.remove('cp-scroll-locked');
    if (!bodyWasLocked) body.classList.remove('cp-scroll-locked');
  };
}

export function moveDialogFocus(event, dialog) {
  const focusable = [...(dialog?.querySelectorAll(dialogFocusableSelector) || [])];
  if (focusable.length === 0) return;

  event.preventDefault();
  const activeIndex = focusable.indexOf(document.activeElement);
  const nextIndex = activeIndex < 0
    ? event.shiftKey ? focusable.length - 1 : 0
    : (activeIndex + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
  focusable[nextIndex].focus();
}

export function useDialogLifecycle({ open, onClose, dialogRef, trapFocus = true }) {
  useEffect(() => {
    if (!open) return undefined;
    const releaseDocumentScroll = lockDocumentScroll();
    const focusDialog = window.requestAnimationFrame(() => {
      if (trapFocus) dialogRef.current?.querySelector(dialogFocusableSelector)?.focus();
    });
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (trapFocus && event.key === 'Tab') moveDialogFocus(event, dialogRef.current);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusDialog);
      window.removeEventListener('keydown', handleKeyDown);
      releaseDocumentScroll();
    };
  }, [dialogRef, onClose, open, trapFocus]);
}
