import React from 'react';
import { ShieldCheck, ExternalLink, Building, Tag, Database, AlertCircle } from 'lucide-react';

export default function PatentResults({ patents }) {
  if (!patents || patents.length === 0) {
    return <div className="glass-panel" style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No patent documents retrieved.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {patents.map((patent) => (
        <div key={patent.patent_id} className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="tag tag-amber">{patent.patent_id}</span>
                <span className="tag" style={{ background: patent.source_provider === 'epo_ops' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)', color: patent.source_provider === 'epo_ops' ? '#fbbf24' : '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <Database size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {patent.source_provider === 'epo_ops' ? 'EPO OPS API' : 'Mock Fixture'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                {patent.title}
              </h3>
            </div>
            {patent.source_url && (
              <a
                href={patent.source_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
              >
                Espacenet Link <ExternalLink size={14} />
              </a>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            {patent.abstract || <em style={{ color: '#94a3b8' }}>Patent abstract summary unavailable from source.</em>}
          </p>

          {patent.claims && patent.claims.length > 0 ? (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)', display: 'block', marginBottom: '0.35rem' }}>
                Key Independent Patent Claims:
              </span>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {patent.claims.map((claim, cIdx) => (
                  <li key={cIdx}>{claim}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              <AlertCircle size={14} style={{ color: '#f59e0b' }} />
              <span>Claims availability: Full text claims require extended EPO biblio query.</span>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building size={14} /> Assignee: {patent.assignee || 'Unknown / Unspecified'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Tag size={14} /> CPC/IPC: {patent.classifications && patent.classifications.length > 0 ? patent.classifications.join(', ') : 'Unclassified'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
