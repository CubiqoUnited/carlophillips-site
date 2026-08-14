import Link from 'next/link';
import { adminSections, statusLabel } from '@/lib/admin/control-plane';
import styles from '@/app/admin/admin.module.css';

function Status({ value }) {
  const normalized = String(value || 'unknown').replaceAll('_', '-');
  return <span className={styles.status} data-status={normalized}>{statusLabel(value)}</span>;
}

function Metric({ label, value, detail }) {
  return (
    <article className={styles.metric}>
      <span className={styles.eyebrow}>{label}</span>
      <strong>{value}</strong>
      <span className={styles.muted}>{detail}</span>
    </article>
  );
}

function BlockerCards({ blockers }) {
  return (
    <div className={styles.cardGrid}>
      {blockers.map(blocker => (
        <article className={styles.card} key={blocker.stageId}>
          <div className={styles.cardHeading}>
            <div>
              <span className={styles.eyebrow}>{blocker.owner}</span>
              <h3>{blocker.stage}</h3>
            </div>
            <Status value={blocker.status} />
          </div>
          <p className={styles.code}>{blocker.code}</p>
          <dl className={styles.detailList}>
            <div><dt>Human action</dt><dd>{blocker.humanAction}</dd></div>
            <div><dt>Resume point</dt><dd>{blocker.resumePoint}</dd></div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function Overview({ model }) {
  return (
    <>
      <section className={styles.metrics} aria-label="Readiness summary">
        <Metric label="Canonical release" value={statusLabel(model.release.state)} detail={model.release.id} />
        <Metric label="Open stages" value={`${model.metrics.openStages}/${model.metrics.stages}`} detail={`${model.metrics.humanRequired} require a human`} />
        <Metric label="Pending approvals" value={model.metrics.pendingApprovals} detail="No approval is implied" />
        <Metric label="Storefront-bound media" value={`${model.metrics.boundMedia}/${model.media.assetCount}`} detail={`${model.metrics.approvedMedia} approved`} />
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>End-to-end path</span><h2>Operational readiness</h2></div>
          <p>Every stage is explicit; a later stage cannot make an earlier gap disappear.</p>
        </div>
        <ol className={styles.stageList}>
          {model.stages.map((stage, index) => (
            <li key={stage.id}>
              <span className={styles.stageIndex}>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{stage.label}</strong><span>{stage.owner}</span></div>
              <Status value={stage.status} />
            </li>
          ))}
        </ol>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>Priority queue</span><h2>Blocked work</h2></div>
          <p>What is blocked, why, who owns it, and the exact safe resume point.</p>
        </div>
        <BlockerCards blockers={model.blockers.slice(0, 6)} />
      </section>
    </>
  );
}

function Rows({ columns, rows, empty = 'No records in this read-only projection.' }) {
  if (!rows.length) return <p className={styles.empty}>{empty}</p>;
  return (
    <div className={styles.tableWrap} role="region" aria-label="Scrollable data table" tabIndex={0}>
      <table>
        <thead><tr>{columns.map(column => <th key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || `${row.label}-${index}`}>
              {columns.map(column => <td key={column.key} data-label={column.label}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionView({ section, model }) {
  if (section === 'overview') return <Overview model={model} />;
  if (section === 'runs') return <Rows columns={[
    { key: 'capability', label: 'Work item' },
    { key: 'lane', label: 'Lane' },
    { key: 'status', label: 'Status', render: row => <Status value={row.status} /> },
    { key: 'attempts', label: 'Attempts' },
    { key: 'evidenceCount', label: 'Evidence' },
  ]} rows={model.run.items} />;
  if (section === 'media') return <Rows columns={[
    { key: 'modality', label: 'Modality' },
    { key: 'requirement', label: 'Requirement' },
    { key: 'status', label: 'Status', render: row => <Status value={row.status} /> },
    { key: 'assetCount', label: 'Candidates' },
  ]} rows={model.media.requirements.map(row => ({ ...row, id: row.modality }))} />;
  if (section === 'approvals') return <Rows columns={[
    { key: 'id', label: 'Approval' },
    { key: 'owner', label: 'Owner' },
    { key: 'status', label: 'Status', render: row => <Status value={row.status} /> },
  ]} rows={model.approvals} />;
  if (section === 'capabilities') return <Rows columns={[
    { key: 'id', label: 'Capability' },
    { key: 'callableSurface', label: 'Surface' },
    { key: 'status', label: 'Access', render: row => <Status value={row.status} /> },
    { key: 'costGate', label: 'Boundary' },
  ]} rows={model.capabilities} />;
  if (section === 'audit') return <Rows columns={[
    { key: 'recordedAt', label: 'Recorded' },
    { key: 'aggregate', label: 'Work item' },
    { key: 'actor', label: 'Actor' },
    { key: 'status', label: 'Status', render: row => <Status value={row.status} /> },
  ]} rows={model.auditEvents} />;

  const stageGroups = {
    drops: ['creation'],
    products: ['product', 'commerce'],
    releases: ['release'],
    publication: ['display', 'release'],
    orders: ['sale', 'post-sale'],
    'post-sale': ['post-sale'],
    analytics: ['learning'],
  };
  const groups = stageGroups[section] || [];
  const blockers = model.blockers.filter(blocker => {
    const stage = model.stages.find(item => item.id === blocker.stageId);
    return groups.includes(stage?.group);
  });
  return <BlockerCards blockers={blockers} />;
}

export function AdminControlPlane({ activeSection, model }) {
  const definition = adminSections.find(section => section.id === activeSection);
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span>CARLOPHILLIPS</span>
          <strong>Control plane</strong>
          <small>Local read-only review</small>
        </div>
        <nav aria-label="Admin sections">
          {adminSections.map(section => (
            <Link key={section.id} href={section.id === 'overview' ? '/admin' : `/admin/${section.id}`} prefetch={false} aria-current={section.id === activeSection ? 'page' : undefined}>
              {section.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main id="main-content" className={styles.main}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Non-authoritative operational projection</span>
            <h1>{definition.label}</h1>
            <p>{definition.description}</p>
          </div>
          <Status value={model.release.state} />
        </header>
        <div className={styles.warning} role="status"><span aria-hidden="true">!</span><p>{model.meta.warning}</p></div>
        <SectionView section={activeSection} model={model} />
      </main>
    </div>
  );
}
