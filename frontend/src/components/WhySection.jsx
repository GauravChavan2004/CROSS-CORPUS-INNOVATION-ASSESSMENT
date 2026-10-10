import React from 'react';
import { ShieldCheck, Search, Cpu, Target, CheckCircle2 } from 'lucide-react';

export default function WhySection() {
  const pillars = [
    {
      icon: <ShieldCheck size={24} color="var(--gold-primary)" />,
      badge: 'Zero-Hallucination',
      title: 'Verifiable Evidence Grounding',
      description: 'Every innovation candidate is strictly backed by traceable citation passages from 250M+ peer-reviewed papers and European Patent Office records. No synthetic hallucinations.'
    },
    {
      icon: <Search size={24} color="var(--accent-cyan)" />,
      badge: 'Hybrid Retrieval',
      title: 'BM25 + FAISS Vector Fusion',
      description: 'Combines exact lexical keyword matching (BM25) with dense semantic embeddings (FAISS) fused through Reciprocal Rank Fusion (RRF) to overcome domain vocabulary mismatch.'
    },
    {
      icon: <Cpu size={24} color="var(--accent-purple)" />,
      badge: 'Mathematical Scorer',
      title: '6-Factor Innovation Metric',
      description: 'Quantifies ideas across Novelty Potential (N), Contextual Relevance (R), Gap Strength (G), Evidence Density (E), Technical Feasibility (F), and Claim Differentiation (D).'
    },
    {
      icon: <Target size={24} color="var(--accent-rose)" />,
      badge: 'Prior-Art Bounds',
      title: 'Idea-Conditioned Gap Detection',
      description: 'Detects unresolved scientific constraints in research literature and isolates patent claim boundaries where white-space commercial opportunities exist.'
    }
  ];

  return (
    <section className="section-wrapper" id="why">
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="section-tag">Value Proposition</span>
        <h2 className="section-heading">Why Dual-Corpus Innovation AI?</h2>
        <p className="section-subtext" style={{ margin: '0 auto' }}>
          Traditional analysis operates in isolated silos. Academic papers emphasize scientific discovery without patent awareness, while patent databases omit theoretical rigor. Our framework unifies both.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {pillars.map((pillar, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pillar.icon}
                </div>
                <span className="tag tag-gold">{pillar.badge}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {pillar.description}
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--gold-light)' }}>
              <CheckCircle2 size={16} /> Operational Framework Standard
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
