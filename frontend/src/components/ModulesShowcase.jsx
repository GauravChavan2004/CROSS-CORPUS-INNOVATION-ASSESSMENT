import React from 'react';
import { Cpu, BarChart3, Box, ArrowRight, Layers } from 'lucide-react';

export default function ModulesShowcase({ onExploreModule }) {
  const modules = [
    {
      number: 'MODULE 01',
      badge: 'HYBRID SEARCH CORE',
      title: 'Dual-Corpus Hybrid Retrieval Engine',
      subtitle: 'BM25 + FAISS Vector Search + RRF Fusion',
      description: 'Jointly indexes live OpenAlex scientific paper literature and European Patent Office (EPO OPS) patent claims. Combines lexical BM25 term frequency with dense FAISS semantic embeddings fused via Reciprocal Rank Fusion (RRF).',
      icon: <Cpu size={24} color="var(--gold-primary)" />,
      tagColor: 'tag-gold',
      actionKey: 'papers'
    },
    {
      number: 'MODULE 02',
      badge: 'ASSESSMENT ENGINE',
      title: '6-Factor Operational Innovation Scorer',
      subtitle: 'Multidimensional Mathematical Assessment',
      description: 'Quantitatively scores candidate innovation opportunities across Novelty Potential (N), Contextual Relevance (R), Gap Strength (G), Evidence Strength (E), Technical Feasibility (F), and Claim Differentiation (D).',
      icon: <BarChart3 size={24} color="var(--accent-cyan)" />,
      tagColor: 'tag-teal',
      actionKey: 'overview'
    },
    {
      number: 'MODULE 03',
      badge: '3D GRAPH CANVAS',
      title: 'Spatial 3D Knowledge Universe Canvas',
      subtitle: 'Interactive Cross-Corpus Graph Visualizer with 3D Animations',
      description: 'Renders an interactive 3D spatial node view mapping proposed core technology ideas, scientific literature nodes, patent prior-art claim boundaries, and unresolved research gap clusters in real-time.',
      icon: <Box size={24} color="var(--accent-purple)" />,
      tagColor: 'tag-purple',
      actionKey: '3d-graph'
    }
  ];

  return (
    <section className="section-wrapper" id="modules" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="section-tag">Framework Architecture</span>
        <h2 className="section-heading">Core System Modules</h2>
        <p className="section-subtext" style={{ margin: '0 auto' }}>
          Explore the three core computational modules powering our Cross-Corpus Innovation AI decision platform.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {modules.map((m, idx) => (
          <div 
            key={idx} 
            className="glass-panel" 
            style={{ 
              padding: '2.25rem', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.icon}
                </div>
                <span className={`tag ${m.tagColor}`}>{m.badge}</span>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold-primary)', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>
                {m.number}
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {m.title}
              </h3>

              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '1rem' }}>
                {m.subtitle}
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                {m.description}
              </p>
            </div>

            <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => onExploreModule(m.actionKey)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Run Assessment <ArrowRight size={15} color="var(--gold-primary)" />
              </button>

              <Layers size={16} color="var(--text-dim)" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
