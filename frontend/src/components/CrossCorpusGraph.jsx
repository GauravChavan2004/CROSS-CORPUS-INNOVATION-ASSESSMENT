import React from 'react';
import { Network, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export default function CrossCorpusGraph({ relationships }) {
  if (!relationships || relationships.length === 0) {
    return <div className="glass-panel" style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No cross-corpus relationships computed.</div>;
  }

  const getRelColor = (type) => {
    if (type === 'paper-to-paper') return 'var(--primary-teal)';
    if (type === 'patent-to-patent') return 'var(--accent-amber)';
    return 'var(--accent-purple)';
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Network style={{ color: 'var(--accent-purple)' }} size={20} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
          Cross-Corpus Knowledge Graph & Prior-Art Relationships ({relationships.length})
        </h3>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {relationships.map((rel) => (
          <div
            key={rel.relationship_id}
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="tag" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                  {rel.source_entity_id}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getRelColor(rel.relationship_type) }}>
                  {rel.relationship_type}
                </span>
                <ArrowRightLeft size={16} style={{ color: getRelColor(rel.relationship_type), margin: '0.2rem 0' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  Score: {rel.score}
                </span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span className="tag" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                  {rel.target_entity_id}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              <div>Extraction: <code style={{ color: 'var(--accent-sky)' }}>{rel.extraction_method}</code></div>
              <div>Confidence: {(rel.confidence * 100).toFixed(0)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
