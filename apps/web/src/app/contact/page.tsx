import { ContactForm } from '@/components/support/ContactForm';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';

export const metadata = {
  title: 'Contact Us | CARLOPHILLIPS',
  description: 'Contact CARLOPHILLIPS customer support.',
};

export default function ContactPage() {
  return (
    <main id="main-content" className="cp-contact-page">
      <StorefrontHeader fixed navigationAriaLabel="Support navigation" />
      <section className="cp-contact-shell cp-shell-wide">
        <div className="cp-contact-intro">
          <p className="cp-label">Support</p>
          <h1>Contact us</h1>
          <p>Tell us what you need. We’ll reply within 1–2 business days.</p>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
