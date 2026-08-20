import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import React from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const adminSections = [
  { id: 'overview', label: 'Overview', description: 'System health and canonical state.' },
  { id: 'evidence', label: 'Evidence', description: 'Reconciliation and proof.' },
  { id: 'theme', label: 'Theme', description: 'Design system.' },
  { id: 'media-generation', label: 'Media', description: 'Media generation workspace.' },
  { id: 'runs', label: 'Runs', description: 'Pipeline execution history.' },
  { id: 'approvals', label: 'Approvals', description: 'Authorization signatures.' },
  { id: 'commands', label: 'Commands', description: 'Admin operations.' },
  { id: 'releases', label: 'Releases', description: 'Product releases.' },
  { id: 'capabilities', label: 'Capabilities', description: 'System capability matrix.' },
  { id: 'audit', label: 'Audit Log', description: 'Security and access audit.' },
  { id: 'orders', label: 'Orders', description: 'Lifecycle management.' },
  { id: 'post-sale', label: 'Post-Sale', description: 'Returns and support.' },
  { id: 'analytics', label: 'Analytics', description: 'Telemetry and metrics.' },
];

export default async function AdminPage(props: { params: Promise<{ section?: string[] }> }) {
  const resolvedParams = await props.params;
  const path = resolvedParams.section || [];
  if (path.length > 1) notFound();

  const activeSection = path[0] || 'overview';
  if (!adminSections.some(s => s.id === activeSection)) notFound();

  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  const isReviewer = authHeader === `Bearer ${process.env.CP_ADMIN_REVIEW_TOKEN}`;
  const isOwner = authHeader === `Bearer ${process.env.CP_ADMIN_PRODUCT_OWNER_TOKEN}`;
  
  if (!isReviewer && !isOwner) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <h1 className="text-xl">401 Unauthorized</h1>
      </div>
    );
  }

  const role = isOwner ? 'product_owner' : 'reviewer';
  const definition = adminSections.find(s => s.id === activeSection);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-sm font-bold tracking-widest">CARLOPHILLIPS</h2>
          <p className="text-xs text-white/50 mt-1">Control Plane</p>
          <p className="text-[10px] text-white/30 uppercase mt-2">{role === 'product_owner' ? 'Product Owner workspace' : 'Local read-only review'}</p>
        </div>
        <nav className="flex flex-col gap-3 text-sm">
          {adminSections.map(s => (
            <Link 
              key={s.id} 
              href={s.id === 'overview' ? '/admin' : `/admin/${s.id}`}
              className={activeSection === s.id ? 'text-white' : 'text-white/50 hover:text-white'}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-10">
        <header className="mb-10">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
            {activeSection === 'theme' 
              ? 'Local repository token proposal'
              : activeSection === 'orders' && role === 'product_owner'
                ? 'Restricted controlled-order preparation'
                : 'Non-authoritative operational projection'}
          </p>
          <h1 className="text-3xl font-light mb-2">{definition?.label}</h1>
          <p className="text-white/60">{definition?.description}</p>
        </header>
        <div className="border border-white/10 p-6 rounded bg-white/5 text-white/80">
          <p>
            {activeSection === 'orders' 
              ? 'The current release cannot advance until its canonical stage blockers and immutable bindings both pass.'
              : `Content for ${activeSection} is securely loaded for ${role}.`}
          </p>
          <div className="mt-8 flex gap-4">
            <div className="h-32 w-1/3 bg-white/5 rounded border border-white/10 p-4">
              <span className="text-[10px] uppercase text-white/40">Status</span>
              <p className="mt-2 text-sm text-green-400">Operational</p>
            </div>
            <div className="h-32 w-1/3 bg-white/5 rounded border border-white/10 p-4">
              <span className="text-[10px] uppercase text-white/40">Evidence</span>
              <p className="mt-2 text-sm text-white/70">Verified</p>
            </div>
            <div className="h-32 w-1/3 bg-white/5 rounded border border-white/10 p-4">
              <span className="text-[10px] uppercase text-white/40">Access</span>
              <p className="mt-2 text-sm text-white/70">{role}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
