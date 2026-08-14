import { ClerkProvider } from '@clerk/nextjs';
import { resolveAdminClerkConfiguration } from '@/lib/admin/clerk-config';
import styles from './admin.module.css';

export const metadata = {
  title: 'Control plane | CARLOPHILLIPS',
  description: 'Protected CARLOPHILLIPS operational review surface.',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }) {
  const content = <div className={styles.boundary}>{children}</div>;
  return resolveAdminClerkConfiguration().ready
    ? <ClerkProvider>{content}</ClerkProvider>
    : content;
}
