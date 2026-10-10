import React from 'react';
import { BarChart3, Award } from 'lucide-react';

export default function ScoreBreakdown({ factors }) {
  if (!factors) return null;

  const factorKeys = [
    { key: 'novelty_potential', label: 'Novelty Potential (N)', color: 'var(--primary-teal)' },
    { key: 'contextual_relevance', label: 'Contextual Relevance (R)', color: 'var(--primary-cyan)' },
    { key: 'gap_strength', label: 'Gap Strength (G)', color: 'var(--accent-amber)' },
    { key: 'evidence_strength', label: 'Evidence Strength (E)', color: 'var(--accent-emerald)' },
    { key: 'feasibility', label: 'Feasibility (F)', color: 'var(--accent-sky)' },
    { key: 'differentiation', label: 'Differentiation (D)', color: 'var(--accent-purple)' },
  ];

  const totalScore = factors.total_innovation_score || 0;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 style={{ color: 'var(--primary-teal)' }} size={20} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Multidimensional Innovation Assessment Score
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(20, 184, 166, 0.15)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '12px', padding: '0.5rem 1rem' }}>
          <Award style={{ color: 'var(--primary-teal)' }} size={22} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Score</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{totalScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ 100</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {factorKeys.map(({ key, label, color }) => {
          const score = factors[key] || 0;
          return (
            <div key={key} className="factor-row">
              <div className="factor-header">
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{score} / 100</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(100, score)}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
