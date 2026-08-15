'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  baseSpacingOptions,
  cornerRadiusOptions,
  textWeightOptions,
} from '@/lib/theme/theme-contract';
import styles from '@/app/admin/admin.module.css';

const labels = {
  accentColor: 'Accent colour',
  cornerRadius: 'Corner radius',
  baseSpacing: 'Base spacing',
  textWeight: 'Text weight',
};

function ValueComparison({ current, proposed }) {
  return (
    <dl className={styles.themeComparison}>
      {Object.keys(labels).map(key => (
        <div key={key}>
          <dt>{labels[key]}</dt>
          <dd><span>Current</span><code>{current[key]}</code></dd>
          <dd><span>Proposed</span><code>{proposed[key]}</code></dd>
        </div>
      ))}
    </dl>
  );
}

export function ThemeEditor({ initialTheme, initialFingerprint, workflow }) {
  const [current, setCurrent] = useState(initialTheme);
  const [fingerprint, setFingerprint] = useState(initialFingerprint);
  const [proposed, setProposed] = useState(initialTheme);
  const [requestState, setRequestState] = useState({ status: 'idle', message: '' });
  const changed = useMemo(
    () => JSON.stringify(current) !== JSON.stringify(proposed),
    [current, proposed]
  );
  const previewStyle = {
    '--cp-theme-preview-accent': proposed.accentColor,
    '--cp-theme-preview-radius': proposed.cornerRadius,
    '--cp-theme-preview-spacing': proposed.baseSpacing,
    '--cp-theme-preview-weight': proposed.textWeight,
  };

  function update(key, value) {
    setProposed(theme => ({
      ...theme,
      [key]: key === 'textWeight' ? Number(value) : value,
    }));
    setRequestState({ status: 'idle', message: '' });
  }

  async function saveProposal(event) {
    event.preventDefault();
    setRequestState({ status: 'saving', message: 'Saving the local branch proposal…' });
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: proposed, expectedFingerprint: fingerprint }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.code === 'THEME_REVISION_STALE') {
          setRequestState({
            status: 'stale',
            message: 'The branch copy changed after this screen loaded. Reload the current revision before saving.',
          });
          return;
        }
        setRequestState({
          status: 'error',
          message: result.errors?.join(' ') || result.error || 'The proposal could not be saved.',
        });
        return;
      }
      setCurrent(proposed);
      setFingerprint(result.fingerprint);
      setRequestState({
        status: 'saved',
        message: result.code === 'THEME_UNCHANGED'
          ? 'No token values changed.'
          : 'Saved to theme.json on this feature branch. Production is unchanged; QA and a pull request are still required.',
      });
    } catch {
      setRequestState({ status: 'error', message: 'The local proposal service is unavailable.' });
    }
  }

  return (
    <>
      <section className={styles.themeBoundary} aria-labelledby="theme-boundary-title">
        <span className={styles.eyebrow}>Hard scope boundary</span>
        <h2 id="theme-boundary-title">Exactly four token values. No layout changes.</h2>
        <p>
          This screen changes accent colour, corner radius, base spacing, and text weight only.
          It cannot add, remove, resize, reorder, or restructure components or sections.
        </p>
      </section>

      <div className={styles.themeGrid}>
        <form className={styles.themeForm} onSubmit={saveProposal}>
          <div className={styles.sectionHeading}>
            <div><span className={styles.eyebrow}>Canonical source</span><h2>theme.json proposal</h2></div>
            <p>Product Owner-only. Values save to the current local feature branch, never to Production.</p>
          </div>

          <label className={styles.themeField}>
            <span>Accent colour <small>4.5:1 minimum on dark canvas</small></span>
            <span className={styles.colorControl}>
              <input
                aria-label="Accent colour picker"
                type="color"
                value={proposed.accentColor}
                onChange={event => update('accentColor', event.target.value)}
              />
              <code>{proposed.accentColor}</code>
            </span>
          </label>

          <label className={styles.themeField}>
            <span>Corner radius</span>
            <select value={proposed.cornerRadius} onChange={event => update('cornerRadius', event.target.value)}>
              {cornerRadiusOptions.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>

          <label className={styles.themeField}>
            <span>Base spacing</span>
            <select value={proposed.baseSpacing} onChange={event => update('baseSpacing', event.target.value)}>
              {baseSpacingOptions.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>

          <label className={styles.themeField}>
            <span>Text weight</span>
            <select value={proposed.textWeight} onChange={event => update('textWeight', event.target.value)}>
              {textWeightOptions.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>

          <div className={styles.themeActions}>
            <button type="submit" disabled={!workflow.writeEnabled || !changed || requestState.status === 'saving'}>
              {requestState.status === 'saving' ? 'Saving proposal…' : 'Save branch proposal'}
            </button>
            <span>{workflow.writeEnabled ? workflow.branch : 'Local theme writes are disabled.'}</span>
          </div>
          {requestState.message ? (
            <div className={styles.themeMessage} role={requestState.status === 'error' ? 'alert' : 'status'} data-state={requestState.status}>
              <p>{requestState.message}</p>
              {requestState.status === 'stale' ? <Link href="/admin/theme" prefetch={false}>Reload current revision</Link> : null}
            </div>
          ) : null}
        </form>

        <aside className={styles.themePreview} style={previewStyle} aria-label="Proposed token preview">
          <span className={styles.eyebrow}>Contained preview</span>
          <div className={styles.themePreviewCard}>
            <span>CARLOPHILLIPS</span>
            <h2>Token proposal</h2>
            <p>Spacing, shape, emphasis, and accent previewed without changing page structure.</p>
            <span className={styles.themePreviewAction}>Review details</span>
          </div>
          <ValueComparison current={current} proposed={proposed} />
        </aside>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>Delivery boundary</span><h2>PR and Preview workflow</h2></div>
          <p>Saving creates only a local, uncommitted repository proposal. It does not create a commit, PR, Preview, publication, or Production change.</p>
        </div>
        <ol className={styles.themeWorkflow}>
          {workflow.steps.map((step, index) => (
            <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>
          ))}
        </ol>
      </section>
    </>
  );
}
