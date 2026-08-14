import styles from './admin.module.css';

export const metadata = {
  title: 'Control plane | CARLOPHILLIPS',
  description: 'Protected CARLOPHILLIPS operational review surface.',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }) {
  return <div className={styles.boundary}>{children}</div>;
}
