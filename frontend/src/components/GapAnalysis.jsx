import React from 'react';
import { Target, AlertCircle, ShieldAlert } from 'lucide-react';

export default function GapAnalysis({ gaps }) {
  if (!gaps || gaps.length === 0) {
    return <div className="glass-panel" style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No candidate gaps identified.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {gaps.map((gap) => (
        <div key={gap.gap_id} className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="tag tag-amber">{gap.gap_id}</span>
            <span className="tag tag-teal">Strength: {(gap.evidence_strength * 100).toFixed(0)}%</span>
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            {gap.gap_description}
          </h4>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--primary-teal)' }}>Reasoning & Idea Context:</strong>
            <p style={{ marginTop: '0.25rem' }}>{gap.reasoning}</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Target size={14} /> Supporting Evidence Passages: {gap.supporting_evidence_ids.length}
            </span>
            <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldAlert size={14} /> Contradictory Evidence: {gap.contradictory_evidence_ids.length}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
