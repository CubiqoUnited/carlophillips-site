import { SignIn } from '@clerk/nextjs';
import { notFound } from 'next/navigation';
import styles from '@/app/admin/admin.module.css';
import { resolveAdminRuntimeSurface } from '@/lib/admin/access-policy';
import { resolveAdminClerkConfiguration } from '@/lib/admin/clerk-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminSignInPage() {
  const runtimeSurface = resolveAdminRuntimeSurface({
    vercelEnvironment: process.env.VERCEL_ENV,
    commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
  });
  const configuration = resolveAdminClerkConfiguration();

  if (!configuration.ready || !['vercel-preview', 'vercel-production'].includes(runtimeSurface)) {
    notFound();
  }

  return (
    <main id="main-content" className={styles.denied}>
      <span className={styles.eyebrow}>Product Owner access</span>
      <h1>Admin sign in</h1>
      <p>Sign in with the single approved Product Owner account.</p>
      <SignIn
        path="/admin/sign-in"
        routing="path"
        fallbackRedirectUrl="/admin/theme"
      />
    </main>
  );
}
