import { notFound } from 'next/navigation';
import { AdminControlPlane } from '@/components/admin/control-plane';
import { requireAdminAccess } from '@/lib/admin/access-server';
import { adminSections } from '@/lib/admin/control-plane';
import { loadAdminControlPlane, loadMediaGenerationWorkspace } from '@/lib/admin/control-plane-server';
import { isMediaGenerationEnabled } from '@/lib/media/media-generation-workspace';
import { loadCanonicalTheme } from '@/lib/theme/theme-repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage({ params }) {
  const resolvedParams = await params;
  const path = resolvedParams.section || [];
  if (path.length > 1) notFound();

  const activeSection = path[0] || 'overview';
  if (!adminSections.some(section => section.id === activeSection)) notFound();
  const mediaGenerationEnabled = isMediaGenerationEnabled(process.env);
  if (activeSection === 'media-generation' && !mediaGenerationEnabled) notFound();
  const access = await requireAdminAccess({
    requiredRole: ['theme', 'media-generation'].includes(activeSection) ? 'product_owner' : null,
  });

  const model = loadAdminControlPlane();
  const themeModel = activeSection === 'theme' ? loadCanonicalTheme() : null;
  const mediaGenerationModel = activeSection === 'media-generation'
    ? loadMediaGenerationWorkspace({ featureEnabled: mediaGenerationEnabled, role: access.role })
    : null;
  return (
    <AdminControlPlane
      activeSection={activeSection}
      model={model}
      themeModel={themeModel}
      mediaGenerationModel={mediaGenerationModel}
      mediaGenerationEnabled={mediaGenerationEnabled}
      viewerRole={access.role}
    />
  );
}
