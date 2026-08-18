import { notFound } from 'next/navigation';
import { AdminControlPlane } from '@/components/admin/control-plane';
import { requireAdminAccess } from '@/lib/admin/access-server';
import { adminSections } from '@/lib/admin/control-plane';
import { loadAdminControlPlane } from '@/lib/admin/control-plane-server';
import { loadCanonicalTheme } from '@/lib/theme/theme-repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage({ params }) {
  const resolvedParams = await params;
  const path = resolvedParams.section || [];
  if (path.length > 1) notFound();

  const activeSection = path[0] || 'overview';
  if (!adminSections.some(section => section.id === activeSection)) notFound();
  const access = await requireAdminAccess({
    requiredRole: activeSection === 'theme' ? 'product_owner' : null,
  });

  const model = loadAdminControlPlane();
  const themeModel = activeSection === 'theme' ? loadCanonicalTheme() : null;
  return (
    <AdminControlPlane
      activeSection={activeSection}
      model={model}
      themeModel={themeModel}
      viewerRole={access.role}
    />
  );
}
