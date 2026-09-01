'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { INTAKE_STATUS, validateSupportRequest } from '../../lib/site/contact-intake.js';
import { SiteHeader } from './site-navigation.jsx';

/*
 * Screens 13 / 26 — Contact Us, with its success and validation states.
 *
 * The form only ever claims a request was sent when the intake route confirms a destination
 * accepted it. An unconfigured support channel is reported as such, with the alternative route to a
 * human, instead of showing the success screen for a message that went nowhere.
 */
function Field({ id, label, onChange, optional = false, rows = 0, value }) {
  return (
    <div className="cp-field">
      <label htmlFor={id} className="cp-field-label">{label}{optional ? ' (optional)' : ''}</label>
      {rows > 0 ? (
        <textarea id={id} name={id} rows={rows} value={value} onChange={event => onChange(event.target.value)} className="cp-field-input cp-field-textarea" />
      ) : (
        <input id={id} name={id} value={value} onChange={event => onChange(event.target.value)} className="cp-field-input" />
      )}
    </div>
  );
}

export function SupportForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(INTAKE_STATUS.idle);

  const submit = async event => {
    event.preventDefault();
    const validation = validateSupportRequest({ name, email, message });
    if (!validation.valid) {
      setStatus(INTAKE_STATUS.invalid);
      return;
    }
    setStatus(INTAKE_STATUS.sending);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ intent: 'support', name, email, orderNumber, subject, message }),
      });
      setStatus(response.ok ? INTAKE_STATUS.sent : INTAKE_STATUS.unavailable);
    } catch {
      setStatus(INTAKE_STATUS.unavailable);
    }
  };

  return (
    <main id="main-content" className="cp-intake-page" data-intake-status={status}>
      <SiteHeader onMenu={() => {}} />
      <div className="cp-intake-shell cp-page-shell">
        <p className="cp-eyebrow">Support</p>
        <h1 className="cp-intake-title">Contact us</h1>

        {status === INTAKE_STATUS.sent ? (
          <div className="cp-intake-outcome">
            <h2 className="cp-intake-outcome-title">Request sent</h2>
            <p className="cp-intake-copy">We will respond within 1–2 business days.</p>
            <Link href="/" className="cp-action cp-action-solid cp-intake-action">Return to discovery</Link>
          </div>
        ) : (
          <>
            <p className="cp-intake-copy">We will respond within 1–2 business days.</p>
            <form className="cp-intake-form" onSubmit={submit} noValidate>
              <Field id="name" label="Name" value={name} onChange={setName} />
              <Field id="email" label="Email" value={email} onChange={setEmail} />
              <Field id="order-number" label="Order number" optional value={orderNumber} onChange={setOrderNumber} />
              <Field id="subject" label="Subject" value={subject} onChange={setSubject} />
              <Field id="message" label="Message" rows={6} value={message} onChange={setMessage} />

              {status === INTAKE_STATUS.invalid && (
                <div className="cp-intake-notice" role="alert">
                  <p className="cp-intake-notice-title">Check required fields</p>
                  <p className="cp-intake-copy">Name, email and message are required.</p>
                </div>
              )}
              {status === INTAKE_STATUS.unavailable && (
                <div className="cp-intake-notice" role="alert">
                  <p className="cp-intake-notice-title">Request not sent</p>
                  <p className="cp-intake-copy">
                    The support channel is unavailable right now, so nothing was submitted. Please try again shortly.
                  </p>
                </div>
              )}

              <button type="submit" disabled={status === INTAKE_STATUS.sending} className="cp-action cp-action-solid cp-intake-action">
                {status === INTAKE_STATUS.sending ? 'Sending request' : status === INTAKE_STATUS.invalid ? 'Update request' : 'Submit request'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
