const gaMeasurementIdPattern = /^G-[A-Z0-9]{6,20}$/;

export function isValidGaMeasurementId(value) {
  return typeof value === 'string' && gaMeasurementIdPattern.test(value);
}

export function canLoadAnalytics({ approved, consent, measurementId }) {
  return approved === true && consent === 'accepted' && isValidGaMeasurementId(measurementId);
}

export function initializeGa(windowObject, measurementId) {
  if (!isValidGaMeasurementId(measurementId)) throw new Error('Invalid GA measurement ID');
  windowObject.dataLayer = windowObject.dataLayer || [];
  windowObject.gtag = (...args) => windowObject.dataLayer.push(args);
  windowObject.gtag('js', new Date());
  windowObject.gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

export function emitGaEvent(windowObject, event) {
  if (typeof windowObject.gtag !== 'function') return false;
  windowObject.gtag('event', event.name, event.properties);
  return true;
}
