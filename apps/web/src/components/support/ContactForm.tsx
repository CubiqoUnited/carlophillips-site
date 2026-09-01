'use client';

import { useState, type FormEvent } from 'react';

const topics = [
  ['order-status', 'Order status'],
  ['shipping-delivery', 'Shipping & delivery'],
  ['return-exchange', 'Return or exchange'],
  ['product-fit', 'Product & fit'],
  ['payment-checkout', 'Payment or checkout'],
  ['other', 'Other'],
] as const;

const orderTopics = new Set([
  'order-status',
  'shipping-delivery',
  'return-exchange',
  'payment-checkout',
]);

type FormStatus = 'idle' | 'sending' | 'sent' | 'invalid' | 'failed';

export function ContactForm() {
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [requestId, setRequestId] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!email || !topic || message.trim().length < 10) {
      setStatus('invalid');
      return;
    }
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          topic,
          orderNumber,
          message,
          website: form.get('website'),
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        requestId?: string;
      };
      if (response.ok && result.ok && result.requestId) {
        setRequestId(result.requestId);
        setStatus('sent');
      } else {
        setStatus(response.status === 400 ? 'invalid' : 'failed');
      }
    } catch {
      setStatus('failed');
    }
  }

  if (status === 'sent')
    return (
      <div className="cp-contact-outcome" role="status">
        <h2>Request sent</h2>
        <p>We’ll reply within 1–2 business days.</p>
        <p className="cp-contact-reference">Reference: {requestId}</p>
      </div>
    );

  return (
    <form className="cp-contact-form" onSubmit={submit} noValidate>
      <div className="cp-contact-field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="cp-contact-field">
        <label htmlFor="contact-topic">How can we help?</label>
        <select
          id="contact-topic"
          name="topic"
          required
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        >
          <option value="">Choose a topic</option>
          {topics.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {orderTopics.has(topic) && (
        <div className="cp-contact-field">
          <label htmlFor="contact-order">Order number (optional)</label>
          <input
            id="contact-order"
            name="orderNumber"
            autoComplete="off"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
          />
        </div>
      )}
      <div className="cp-contact-field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={7}
          minLength={10}
          maxLength={4000}
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
      <div className="cp-contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="cp-contact-feedback" aria-live="polite">
        {status === 'invalid' && (
          <p>Please enter a valid email, choose a topic, and add a message.</p>
        )}
        {status === 'failed' && (
          <p>Your request was not sent. Please try again shortly.</p>
        )}
      </div>
      <button
        type="submit"
        className="cp-action cp-action-solid cp-contact-submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}
