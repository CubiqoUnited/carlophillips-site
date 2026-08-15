import styles from './admin.module.css';

export default function AdminNotFound() {
  return (
    <main id="main-content" className={styles.denied}>
      <span className={styles.eyebrow}>404</span>
      <h1>Page not available</h1>
      <p>The requested page is not available in this environment.</p>
    </main>
  );
}
