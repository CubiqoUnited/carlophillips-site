import Link from 'next/link';
import { adminSections, statusLabel } from '@/lib/admin/control-plane';
import { ThemeEditor } from './theme-editor';
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
        <Metric label="Evidence conflicts" value={model.metrics.evidenceConflicts} detail="Require reconciliation" />
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

function EvidenceHealth({ model }) {
  const nextActions = model.evidence.safeNextActions.map(action => ({
    stageId: action.id,
    stage: action.label,
    owner: action.owner,
    status: action.authority,
    code: action.code,
    humanAction: action.humanAction,
    resumePoint: action.resumePoint,
  }));

  return (
    <>
      <section className={styles.metrics} aria-label="Evidence reconciliation summary">
        <Metric label="Evidence records" value={model.evidence.metrics.records} detail={`As of ${model.evidence.asOfDate}`} />
        <Metric label="Conflicts" value={model.evidence.metrics.conflicts} detail="Source contradictions" />
        <Metric label="Stale observations" value={model.evidence.metrics.stale} detail="Older than seven days" />
        <Metric label="Missing bindings" value={model.evidence.metrics.missing} detail="Cannot grant authority" />
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>Canonical reconciliation</span><h2>Evidence is not authority</h2></div>
          <p>{model.evidence.evidenceBoundary}</p>
        </div>
        <Rows columns={[
          { key: 'label', label: 'Evidence' },
          { key: 'classification', label: 'Class', render: row => <Status value={row.classification} /> },
          { key: 'freshness', label: 'Freshness', render: row => <Status value={row.freshness} /> },
          { key: 'observedAt', label: 'Observed', render: row => row.observedAt || 'Not recorded' },
          { key: 'technicalAccess', label: 'Technical evidence' },
          { key: 'operationalAuthority', label: 'Operating authority', render: row => <Status value={row.operationalAuthority} /> },
          { key: 'issueCode', label: 'Dependency' },
        ]} rows={model.evidence.records} />
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>Approval queue</span><h2>Safe next actions</h2></div>
          <p>Instructions only. This local screen has no connector, spend, order, publication, or Production authority.</p>
        </div>
        <BlockerCards blockers={nextActions} />
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

function LifecycleView({ summary, blockers }) {
  return (
    <>
      <article className={styles.emptyState}>
        <div className={styles.cardHeading}>
          <div><span className={styles.eyebrow}>Canonical empty state</span><h2>{summary.title}</h2></div>
          <Status value={summary.status} />
        </div>
        <p>{summary.detail}</p>
      </article>
      {summary.rows.length ? <Rows columns={[
        { key: 'sequence', label: 'Sequence' },
        { key: 'event', label: 'Event' },
        { key: 'source', label: 'Source' },
        { key: 'recordedAt', label: 'Recorded' },
        { key: 'classification', label: 'Classification', render: row => <Status value={row.classification} /> },
      ]} rows={summary.rows} /> : null}
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>Dependencies</span><h2>Blocked lifecycle stages</h2></div>
          <p>These gates must pass before an operational record can appear.</p>
        </div>
        <BlockerCards blockers={blockers} />
      </section>
    </>
  );
}

function CommandsView({ commands }) {
  return (
    <>
      <article className={styles.emptyState}>
        <div className={styles.cardHeading}>
          <div><span className={styles.eyebrow}>Canonical empty state</span><h2>{commands.title}</h2></div>
          <Status value={commands.status} />
        </div>
        <p>{commands.detail}</p>
      </article>
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>Execution boundary</span><h2>Required command gates</h2></div>
          <p>Every row must be backed by current durable evidence before a command can leave this read-only projection.</p>
        </div>
        <Rows columns={[
          { key: 'gate', label: 'Gate' },
          { key: 'status', label: 'Status', render: row => <Status value={row.status} /> },
          { key: 'boundary', label: 'Current boundary' },
        ]} rows={commands.rows} />
      </section>
    </>
  );
}

function SectionView({ section, model, themeModel }) {
  if (section === 'overview') return <Overview model={model} />;
  if (section === 'evidence') return <EvidenceHealth model={model} />;
  if (section === 'theme') {
    return (
      <ThemeEditor
        initialTheme={themeModel.theme}
        initialFingerprint={themeModel.fingerprint}
        workflow={themeModel.workflow}
      />
    );
  }
  if (section === 'runs') return <Rows columns={[
    { key: 'capability', label: 'Work item' },
    { key: 'lane', label: 'Lane' },
    { key: 'sourceStatus', label: 'Source status', render: row => <Status value={row.sourceStatus} /> },
    { key: 'evidenceState', label: 'Evidence state', render: row => <Status value={row.evidenceState} /> },
    { key: 'lastObservedAt', label: 'Last observed', render: row => row.lastObservedAt || 'Not recorded' },
    { key: 'currentAuthority', label: 'Current authority' },
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
  if (section === 'commands') return <CommandsView commands={model.commands} />;
  if (section === 'capabilities') return <Rows columns={[
    { key: 'id', label: 'Capability' },
    { key: 'callableSurface', label: 'Surface' },
    { key: 'technicalAccess', label: 'Technical access', render: row => <Status value={row.technicalAccess} /> },
    { key: 'observedAt', label: 'Observed', render: row => row.observedAt || 'Not recorded' },
    { key: 'evidenceClass', label: 'Evidence class', render: row => <Status value={row.evidenceClass} /> },
    { key: 'operationalAuthority', label: 'Operating authority', render: row => <Status value={row.operationalAuthority} /> },
    { key: 'blockingDependency', label: 'Blocking dependency' },
  ]} rows={model.capabilities} />;
  if (section === 'audit') return <Rows columns={[
    { key: 'recordedAt', label: 'Recorded' },
    { key: 'aggregate', label: 'Work item' },
    { key: 'actor', label: 'Actor' },
    { key: 'status', label: 'Status', render: row => <Status value={row.status} /> },
    { key: 'evidenceState', label: 'Evidence state', render: row => <Status value={row.evidenceState} /> },
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
  if (section === 'orders') return <LifecycleView summary={model.lifecycle.orders} blockers={blockers} />;
  if (section === 'post-sale') return <LifecycleView summary={model.lifecycle.postSale} blockers={blockers} />;
  if (section === 'analytics') return <LifecycleView summary={model.lifecycle.analytics} blockers={blockers} />;
  return <BlockerCards blockers={blockers} />;
}

export function AdminControlPlane({ activeSection, model, themeModel, viewerRole }) {
  const definition = adminSections.find(section => section.id === activeSection);
  const visibleSections = adminSections.filter(
    section => section.id !== 'theme' || viewerRole === 'product_owner'
  );
  const isTheme = activeSection === 'theme';
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span>CARLOPHILLIPS</span>
          <strong>Control plane</strong>
          <small>{viewerRole === 'product_owner' ? 'Product Owner workspace' : 'Local read-only review'}</small>
        </div>
        <p className={styles.navHint}>Scroll navigation for more sections →</p>
        <nav aria-label="Admin sections">
          {visibleSections.map(section => (
            <Link key={section.id} href={section.id === 'overview' ? '/admin' : `/admin/${section.id}`} prefetch={false} aria-current={section.id === activeSection ? 'page' : undefined}>
              {section.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main id="main-content" className={styles.main}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{isTheme ? 'Local repository token proposal' : 'Non-authoritative operational projection'}</span>
            <h1>{definition.label}</h1>
            <p>{definition.description}</p>
          </div>
          {isTheme ? <Status value="branch_proposal" /> : <Status value={model.release.state} />}
        </header>
        <div className={styles.warning} role="status"><span aria-hidden="true">!</span><p>{isTheme ? 'Local repo proposal only. Production is unchanged; QA, pull request, Preview, review, and merge remain separate.' : model.meta.warning}</p></div>
        <SectionView section={activeSection} model={model} themeModel={themeModel} />
      </main>
    </div>
  );
}
