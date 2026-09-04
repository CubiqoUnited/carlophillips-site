'use client';

import { FormEvent, useEffect, useState } from 'react';

const STORAGE_KEY = 'cp.fit-memory.v1';
const sizes = ['S', 'M', 'L'] as const;
const fits = ['True to size', 'Relaxed', 'Oversized'] as const;

export function FitMemory() {
  const [size, setSize] = useState('');
  const [fit, setFit] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { size?: string; fit?: string };
      if (sizes.includes(parsed.size as (typeof sizes)[number]))
        setSize(parsed.size || '');
      if (fits.includes(parsed.fit as (typeof fits)[number]))
        setFit(parsed.fit || '');
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!size || !fit) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ size, fit }));
    setSaved(true);
  }

  return (
    <form className="cp-member-form" onSubmit={submit}>
      <p className="cp-member-section-label">Fit memory</p>
      <h3>Remember this device.</h3>
      <label>
        Preferred size
        <select
          value={size}
          onChange={(event) => setSize(event.target.value)}
          required
        >
          <option value="">Choose a size</option>
          {sizes.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        Preferred fit
        <select
          value={fit}
          onChange={(event) => setFit(event.target.value)}
          required
        >
          <option value="">Choose a fit</option>
          {fits.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <button className="cp-member-button" type="submit">
        Save fit preference
      </button>
      <p
        className="cp-member-form-footnote"
        role={saved ? 'status' : undefined}
      >
        {saved
          ? 'Fit preference saved on this device.'
          : 'Stores size and fit on this device only. No email, order or payment data is stored.'}
      </p>
    </form>
  );
}
