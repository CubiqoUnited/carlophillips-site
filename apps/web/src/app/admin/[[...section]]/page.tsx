import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';
import { requireAdminAccess } from '@/lib/admin/access-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const adminSections = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'System health and canonical state.',
  },
  {
    id: 'evidence',
    label: 'Evidence',
    description: 'Reconciliation and proof.',
  },
  { id: 'theme', label: 'Theme', description: 'Design system.' },
  {
    id: 'media-generation',
    label: 'Media',
    description: 'Media generation workspace.',
  },
  { id: 'runs', label: 'Runs', description: 'Pipeline execution history.' },
  {
    id: 'approvals',
    label: 'Approvals',
    description: 'Authorization signatures.',
  },
  { id: 'commands', label: 'Commands', description: 'Admin operations.' },
  { id: 'releases', label: 'Releases', description: 'Product releases.' },
  {
    id: 'capabilities',
    label: 'Capabilities',
    description: 'System capability matrix.',
  },
  {
    id: 'audit',
    label: 'Audit Log',
    description: 'Security and access audit.',
  },
  { id: 'orders', label: 'Orders', description: 'Lifecycle management.' },
  { id: 'post-sale', label: 'Post-Sale', description: 'Returns and support.' },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Telemetry and metrics.',
  },
];

export default async function AdminPage(props: {
  params: Promise<{ section?: string[] }>;
}) {
  const resolvedParams = await props.params;
  const path = resolvedParams.section || [];
  if (path.length > 1) notFound();

  const activeSection = path[0] || 'overview';
  if (!adminSections.some((section) => section.id === activeSection))
    notFound();

  const access = await requireAdminAccess({
    requiredRole: ['theme', 'media-generation'].includes(activeSection)
      ? 'product_owner'
      : null,
  });
  if (!access.allowed) notFound();

  const role = access.role;
  const definition = adminSections.find(
    (section) => section.id === activeSection
  );

  return (
    <div className="cp-admin-shell">
      <aside className="cp-admin-sidebar">
        <div className="cp-admin-brand">
          <h2 className="cp-admin-brand-name">CARLOPHILLIPS</h2>
          <p className="cp-admin-brand-subtitle">Control Plane</p>
          <p className="cp-admin-workspace-label">
            {role === 'product_owner'
              ? 'Product Owner workspace'
              : 'Local read-only review'}
          </p>
        </div>
        <nav className="cp-admin-navigation" aria-label="Admin sections">
          {adminSections.map((section) => (
            <Link
              key={section.id}
              href={
                section.id === 'overview' ? '/admin' : `/admin/${section.id}`
              }
              className="cp-admin-navigation-link"
              aria-current={activeSection === section.id ? 'page' : undefined}
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="cp-admin-main">
        <header className="cp-admin-header">
          <p className="cp-admin-eyebrow">
            {activeSection === 'theme'
              ? 'Local repository token proposal'
              : activeSection === 'orders' && role === 'product_owner'
                ? 'Restricted controlled-order preparation'
                : 'Non-authoritative operational projection'}
          </p>
          <h1 className="cp-admin-title">{definition?.label}</h1>
          <p className="cp-admin-description">{definition?.description}</p>
        </header>

        {activeSection === 'analytics' ? (
          <section
            className="cp-admin-panel cp-admin-empty-state"
            aria-labelledby="analytics-state-title"
          >
            <p className="cp-admin-panel-label">Preview state</p>
            <h2 className="cp-admin-panel-title" id="analytics-state-title">
              No verified analytics are connected
            </h2>
            <p className="cp-admin-panel-copy">
              This workspace does not have an approved telemetry source or a
              verified production data feed. Metrics, funnels, and event
              activity remain unavailable until evidence is connected and
              identified.
            </p>
            <dl className="cp-admin-state-list">
              <div className="cp-admin-state-row">
                <dt>Data source</dt>
                <dd>Not connected</dd>
              </div>
              <div className="cp-admin-state-row">
                <dt>Reporting scope</dt>
                <dd>None</dd>
              </div>
              <div className="cp-admin-state-row">
                <dt>Evidence status</dt>
                <dd>Unavailable</dd>
              </div>
            </dl>
          </section>
        ) : (
          <section className="cp-admin-panel">
            <p className="cp-admin-panel-copy">
              {activeSection === 'orders'
                ? 'The current release cannot advance until its canonical stage blockers and immutable bindings both pass.'
                : `This ${activeSection} view is a non-authoritative projection for ${role}.`}
            </p>
            <dl className="cp-admin-summary-grid">
              <div className="cp-admin-summary-card">
                <dt className="cp-admin-panel-label">Authority</dt>
                <dd className="cp-admin-summary-value">Projection only</dd>
              </div>
              <div className="cp-admin-summary-card">
                <dt className="cp-admin-panel-label">Evidence</dt>
                <dd className="cp-admin-summary-value">No evidence bound</dd>
              </div>
              <div className="cp-admin-summary-card">
                <dt className="cp-admin-panel-label">Access</dt>
                <dd className="cp-admin-summary-value">{role}</dd>
              </div>
            </dl>
          </section>
        )}
      </main>
    </div>
  );
}
