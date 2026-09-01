'use client';

import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useDialogLifecycle } from '../storefront/dialog-lifecycle.js';

/*
 * Screen 22 — Size Guide. The table and its note are the workbook's approved copy; the values are
 * garment measurements, which the closing line states explicitly so a customer does not read them
 * as body measurements.
 */
export const SIZE_GUIDE_ROWS = Object.freeze([
  Object.freeze({ size: 'S', chest: '48 cm', length: '66 cm' }),
  Object.freeze({ size: 'M', chest: '52 cm', length: '69 cm' }),
  Object.freeze({ size: 'L', chest: '56 cm', length: '72 cm' }),
]);

export function SizeGuideDrawer({ onClose, open }) {
  const dialogRef = useRef(null);
  useDialogLifecycle({ open, onClose, dialogRef });
  if (!open) return null;

  return (
    <aside
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      className="cp-side-drawer cp-size-guide-drawer"
    >
      <header className="cp-drawer-header">
        <h2 id="size-guide-title" className="cp-drawer-title">Size guide</h2>
        <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label="Close size guide">
          <X className="cp-icon cp-icon-medium" />
        </button>
      </header>
      <div className="cp-drawer-body">
        <table className="cp-size-table">
          <thead>
            <tr>
              <th scope="col">Size</th>
              <th scope="col">Chest</th>
              <th scope="col">Length</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_GUIDE_ROWS.map(row => (
              <tr key={row.size}>
                <th scope="row">{row.size}</th>
                <td>{row.chest}</td>
                <td>{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="cp-size-table-note">Measurements are garment measurements.</p>
        <button type="button" onClick={onClose} className="cp-action cp-action-outline cp-size-guide-close">Close</button>
      </div>
    </aside>
  );
}
