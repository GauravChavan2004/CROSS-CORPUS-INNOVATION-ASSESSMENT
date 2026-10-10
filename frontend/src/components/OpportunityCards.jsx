import React from 'react';
import { Lightbulb, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function OpportunityCards({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return <div className="glass-panel" style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No innovation recommendations generated.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {recommendations.map((rec) => (
        <div key={rec.recommendation_id} className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--primary-teal)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb style={{ color: 'var(--accent-amber)' }} size={22} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                {rec.recommendation_id}
              </span>
            </div>
            <span className="tag tag-teal">Actionability: {rec.actionability}</span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            {rec.opportunity_description}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={16} /> Key Potential Advantages:
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {rec.potential_advantages.map((adv, idx) => (
                  <li key={idx}>{adv}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={16} /> Potential Risks & Technical Bottlenecks:
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {rec.potential_risks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Identified Gap: {rec.identified_gap}</span>
            <span>Supporting Evidences: {rec.supporting_evidence_ids.join(', ')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
