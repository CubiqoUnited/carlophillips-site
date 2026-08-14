import { notFound } from 'next/navigation';
import { AdminControlPlane } from '@/components/admin/control-plane';
import { requireLocalAdminAccess } from '@/lib/admin/access-server';
import { adminSections } from '@/lib/admin/control-plane';
import { loadAdminControlPlane } from '@/lib/admin/control-plane-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage({ params }) {
  await requireLocalAdminAccess();
  const resolvedParams = await params;
  const path = resolvedParams.section || [];
  if (path.length > 1) notFound();

  const activeSection = path[0] || 'overview';
  if (!adminSections.some(section => section.id === activeSection)) notFound();

  const model = loadAdminControlPlane();
  return <AdminControlPlane activeSection={activeSection} model={model} />;
}
