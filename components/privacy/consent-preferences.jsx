'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createAnalyticsEvent } from '@/lib/analytics/event-contract';
import { canLoadAnalytics, emitGaEvent, initializeGa } from '@/lib/analytics/browser-loader';

const storageKey = 'cp_optional_analytics_consent_v1';
const analyticsApproved = process.env.NEXT_PUBLIC_ANALYTICS_APPROVED === 'true';
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export function ConsentPreferences() {
  const [choice, setChoice] = useState(null);
  const [open, setOpen] = useState(false);
  const [analyticsReady, setAnalyticsReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === 'accepted' || saved === 'rejected') setChoice(saved);
  }, []);

  function choose(nextChoice) {
    window.localStorage.setItem(storageKey, nextChoice);
    setChoice(nextChoice);
    setOpen(false);
  }

  const analyticsEnabled = canLoadAnalytics({ approved: analyticsApproved, consent: choice, measurementId });

  useEffect(() => {
    if (!analyticsEnabled || !analyticsReady) return;
    const routeGroup = pathname.startsWith('/products/') ? 'product' : pathname.split('/')[1] || 'home';
    const event = createAnalyticsEvent('page_view', { route_group: routeGroup });
    emitGaEvent(window, event);
  }, [analyticsEnabled, analyticsReady, pathname]);

  return (
    <>
      {analyticsEnabled ? (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
          onLoad={() => {
            initializeGa(window, measurementId);
            setAnalyticsReady(true);
          }}
          onError={() => setAnalyticsReady(false)}
        />
      ) : null}

      {!choice || open ? (
        <section className="cp-consent" aria-labelledby="cp-consent-title">
          <div>
            <p id="cp-consent-title" className="cp-consent-title">Your privacy choices</p>
            <p>We use essential storage to remember this choice. Optional analytics stays off unless you accept it.</p>
          </div>
          <div className="cp-consent-actions">
            <button type="button" onClick={() => choose('rejected')}>Reject optional analytics</button>
            <button type="button" onClick={() => choose('accepted')}>Accept optional analytics</button>
          </div>
        </section>
      ) : null}

      {choice && !open ? <button type="button" className="cp-cookie-trigger" onClick={() => setOpen(true)}>Cookie preferences</button> : null}
    </>
  );
}
