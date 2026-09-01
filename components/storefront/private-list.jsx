'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { INTAKE_STATUS, validateEmailSignup } from '../../lib/site/contact-intake.js';
import { SiteHeader } from './site-navigation.jsx';

/*
 * Screens 16 / 17 / 18 / 28 — Private List sign-up, confirmation, validation, already registered.
 *
 * Four states, one form. As with support, the confirmation state is only reached when the intake
 * route confirms the address was accepted; a 409 from the destination is the "already on the list"
 * state, and an unconfigured channel says so rather than promising a subscription.
 */
export function PrivateList() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(INTAKE_STATUS.idle);

  const submit = async event => {
    event.preventDefault();
    if (!validateEmailSignup(email)) {
      setStatus(INTAKE_STATUS.invalid);
      return;
    }
    setStatus(INTAKE_STATUS.sending);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ intent: 'private-list', email }),
      });
      if (response.ok) setStatus(INTAKE_STATUS.sent);
      else if (response.status === 409) setStatus(INTAKE_STATUS.alreadyRegistered);
      else setStatus(INTAKE_STATUS.unavailable);
    } catch {
      setStatus(INTAKE_STATUS.unavailable);
    }
  };

  const reset = () => {
    setEmail('');
    setStatus(INTAKE_STATUS.idle);
  };

  return (
    <main id="main-content" className="cp-intake-page" data-intake-status={status}>
      <SiteHeader onMenu={() => {}} />
      <div className="cp-intake-shell cp-intake-shell-centred cp-page-shell">
        <p className="cp-eyebrow">Private list</p>

        {status === INTAKE_STATUS.sent && (
          <div className="cp-intake-outcome">
            <h1 className="cp-intake-title">You are on the list</h1>
            <p className="cp-intake-copy">Check your inbox to confirm your email address.</p>
            <Link href="/" className="cp-action cp-action-solid cp-intake-action">Continue to discovery</Link>
            <button type="button" onClick={reset} className="cp-intake-quiet">Use a different email</button>
          </div>
        )}

        {status === INTAKE_STATUS.alreadyRegistered && (
          <div className="cp-intake-outcome">
            <h1 className="cp-intake-title">Already on the list</h1>
            <p className="cp-intake-copy">This email is already registered for private releases.</p>
            <Link href="/" className="cp-action cp-action-solid cp-intake-action">Continue to discovery</Link>
            <button type="button" onClick={reset} className="cp-intake-quiet">Use a different email</button>
          </div>
        )}

        {status !== INTAKE_STATUS.sent && status !== INTAKE_STATUS.alreadyRegistered && (
          <>
            <h1 className="cp-intake-title">
              {status === INTAKE_STATUS.invalid ? 'Enter a valid email' : 'Join the list'}
            </h1>
            <p className="cp-intake-copy">
              {status === INTAKE_STATUS.invalid
                ? 'Please check your email address and try again.'
                : 'Private releases, early access and selected notes.'}
            </p>
            <form className="cp-intake-form cp-intake-form-compact" onSubmit={submit} noValidate>
              <div className="cp-field">
                <label htmlFor="private-list-email" className="cp-field-label">Email address</label>
                <input
                  id="private-list-email"
                  name="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={event => setEmail(event.target.value)}
                  className="cp-field-input"
                />
              </div>
              {status === INTAKE_STATUS.unavailable && (
                <div className="cp-intake-notice" role="alert">
                  <p className="cp-intake-notice-title">Sign-up unavailable</p>
                  <p className="cp-intake-copy">Nothing was submitted. Please try again shortly.</p>
                </div>
              )}
              <button type="submit" disabled={status === INTAKE_STATUS.sending} className="cp-action cp-action-solid cp-intake-action">
                {status === INTAKE_STATUS.sending ? 'Joining' : status === INTAKE_STATUS.invalid ? 'Try again' : 'Join list'}
              </button>
              <Link href="/" className="cp-intake-quiet">Return to landing</Link>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
