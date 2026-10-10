import React from 'react';
import { Box, Sparkles, Orbit, Eye, MousePointerClick, ArrowUpRight } from 'lucide-react';

export default function Dashboard3DSpotlight({ onLaunch3DUniverse }) {
  const features = [
    {
      icon: <Orbit size={20} color="var(--gold-primary)" />,
      title: '360° Real-Time Orbit Dynamics',
      desc: 'Smooth spatial camera rotation with intuitive mouse-drag physics and orbital velocity controls.'
    },
    {
      icon: <Sparkles size={20} color="var(--accent-cyan)" />,
      title: 'Animated Energy Pulse Beams',
      desc: 'Dynamic light particles traveling along cross-corpus links visualizing literature citation influence and patent prior-art bounds.'
    },
    {
      icon: <Box size={20} color="var(--accent-purple)" />,
      title: '3D Depth Layering & Perspective',
      desc: 'Z-depth sorting, adaptive FOV scaling, and cosmic particle dust simulating an immersive knowledge cosmos.'
    },
    {
      icon: <MousePointerClick size={20} color="var(--accent-rose)" />,
      title: 'Interactive Node Deep Inspector',
      desc: 'Click on any paper sphere, patent node, or gap cluster in 3D space to immediately inspect abstracts, claims, and severity metrics.'
    }
  ];

  return (
    <section className="section-wrapper" id="3d-universe" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <div className="glass-panel" style={{ padding: '3rem 2.5rem', background: 'radial-gradient(circle at 80% 20%, rgba(197, 155, 76, 0.12) 0%, rgba(13, 18, 30, 0.85) 60%)', border: '1px solid var(--border-gold)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <div className="pill-badge" style={{ marginBottom: '1rem' }}>
              <span className="pill-dot"></span>
              3D ANIMATIONS IN DASHBOARD
            </div>

            <h2 style={{ fontSize: 'clamp(2rem, 3.2vw, 2.8rem)', fontWeight: 850, color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Spatial 3D Animated Cross-Corpus Universe
            </h2>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '2rem' }}>
              Experience research intelligence beyond flat 2D tables. Our spatial 3D engine renders every paper citation, patent prior-art boundary, and unresolved gap cluster in a real-time animated universe directly inside your analysis dashboard.
            </p>

            <button
              onClick={onLaunch3DUniverse}
              className="btn-gold"
            >
              LAUNCH 3D UNIVERSE CANVAS <ArrowUpRight size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.04)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '12px', 
                  padding: '1.25rem',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  {feat.icon}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  {feat.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
