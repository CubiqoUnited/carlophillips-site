import { SignIn } from '@clerk/nextjs';
import { notFound } from 'next/navigation';
import { resolveAdminClerkConfiguration } from '@/lib/admin/clerk-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminSignInPage() {
  if (!resolveAdminClerkConfiguration().ready) notFound();
  return <SignIn fallbackRedirectUrl="/admin" />;
}
