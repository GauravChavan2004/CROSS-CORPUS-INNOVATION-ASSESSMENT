import React from 'react';
import { BookOpen, ShieldCheck, Layers, CheckCircle2 } from 'lucide-react';

export default function EnvironmentSection() {
  const environments = [
    {
      num: '01',
      badge: 'LIVE PAPER CORPUS',
      title: 'Scientific Literature Environment',
      provider: 'OpenAlex Live API',
      description: 'Grounds research ideas in peer-reviewed scientific journals, arXiv preprints, and 250M+ scholarly works with full citation graph provenance.',
      features: [
        'BM25 Keyword Frequency',
        'FAISS Vector Semantic Indexing',
        'Reciprocal Rank Fusion (RRF)'
      ],
      icon: <BookOpen size={22} color="#2dd4bf" />,
      borderGlow: 'rgba(20, 184, 166, 0.3)'
    },
    {
      num: '02',
      badge: 'WORLDWIDE PATENT CLAIMS',
      title: 'Intellectual Property Environment',
      provider: 'EPO OPS Patent API',
      description: 'Retrieves claims and legal prior art from the European Patent Office and international patent classification (IPC/CPC) databases.',
      features: [
        'Prior-Art Boundary Detection',
        'Claim Overlap Analysis',
        'Patentability Risk Matrix'
      ],
      icon: <ShieldCheck size={22} color="#c084fc" />,
      borderGlow: 'rgba(168, 85, 247, 0.3)'
    },
    {
      num: '03',
      badge: 'RELATABLE 3RD ENVIRONMENT',
      title: 'Enterprise & Clinical Execution Environment',
      provider: '3rd Relatable Environment',
      description: 'The vital 3rd environment bridging theoretical science and patent claims with real-world clinical trial signals, market demand metrics, private R&D data, and offline fixture execution.',
      features: [
        'Clinical Trial Grounding',
        'Market Commercial Viability',
        'Deterministic Mock/Live Runtime Switch'
      ],
      icon: <Layers size={22} color="var(--gold-primary)" />,
      borderGlow: 'var(--border-gold)'
    }
  ];

  return (
    <section className="section-wrapper" id="environments" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="section-tag">Multidimensional Data Architecture</span>
        <h2 className="section-heading">The 3-Environment Ecosystem</h2>
        <p className="section-subtext" style={{ margin: '0 auto' }}>
          Our cross-corpus decision matrix operates across three synchronized data environments to ensure comprehensive coverage and zero hallucinated claims.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {environments.map((env, idx) => (
          <div 
            key={idx} 
            className="glass-panel" 
            style={{ 
              padding: '2.25rem', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              borderColor: env.borderGlow
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 850, color: 'var(--text-main)', opacity: 0.85 }}>
                  {env.num}
                </span>
                <span className="tag" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${env.borderGlow}`, color: 'var(--text-main)', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  {env.badge}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                {env.icon}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {env.title}
                </h3>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '1rem' }}>
                Provider: {env.provider}
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                {env.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {env.features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    <CheckCircle2 size={15} color="var(--gold-primary)" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
