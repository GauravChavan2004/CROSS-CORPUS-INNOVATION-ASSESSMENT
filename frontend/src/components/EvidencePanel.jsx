import React from 'react';
import { FileText, Link, ShieldCheck } from 'lucide-react';

export default function EvidencePanel({ evidence }) {
  if (!evidence || evidence.length === 0) {
    return <div className="glass-panel" style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No evidence passages extracted.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {evidence.map((item) => (
        <div
          key={item.evidence_id}
          className="glass-panel"
          style={{
            padding: '1.15rem',
            borderLeft: item.document_type === 'paper' ? '3px solid var(--primary-teal)' : '3px solid var(--accent-amber)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="tag" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                {item.evidence_id}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Doc: <code style={{ color: 'var(--accent-sky)' }}>{item.document_id}</code> ({item.document_type})
              </span>
            </div>
            <span className="tag tag-teal">
              Confidence: {(item.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontStyle: 'italic', background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
            "{item.passage_text}"
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <span>Location: {item.passage_location || 'abstract'} | Type: {item.evidence_type}</span>
            {item.source_url && (
              <a href={item.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-teal)' }}>
                Verify Source Passages &rarr;
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
