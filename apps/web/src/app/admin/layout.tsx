import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { resolveAdminClerkConfiguration } from '@/lib/admin/clerk-config';

export const metadata = {
  title: 'Control plane | CARLOPHILLIPS',
  description: 'Protected CARLOPHILLIPS operational review surface.',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const content = <div>{children}</div>;
  return resolveAdminClerkConfiguration().ready ? (
    <ClerkProvider>{content}</ClerkProvider>
  ) : (
    content
  );
}
