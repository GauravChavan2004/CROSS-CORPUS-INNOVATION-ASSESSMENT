import React, { useState } from 'react';
import { X, CheckCircle, ArrowUpRight, Sparkles } from 'lucide-react';

export default function ConsultationModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    domain: 'Healthcare & Biotechnology',
    objective: 'Cross-Corpus Innovation & Gap Discovery'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // keep submitted state briefly
    }, 500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 7, 12, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '2.5rem',
          position: 'relative',
          borderColor: 'var(--border-gold)',
          background: 'var(--bg-card-solid)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px var(--gold-glow)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(197, 155, 76, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--gold-primary)' }}>
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Consultation Scheduled
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Thank you, <strong>{formData.name}</strong>. Our R&D and patent intelligence team has reserved your technical session. We will contact you at <strong>{formData.email}</strong> shortly.
            </p>
            <button
              onClick={() => { setSubmitted(false); onClose(); }}
              className="btn-gold"
              style={{ width: '100%' }}
            >
              CLOSE WINDOW
            </button>
          </div>
        ) : (
          <div>
            <div className="pill-badge" style={{ marginBottom: '1rem' }}>
              <span className="pill-dot"></span>
              EXECUTIVE R&D SESSION
            </div>

            <h3 style={{ fontSize: '1.65rem', fontWeight: 850, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Schedule Technical Consultation
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.75rem' }}>
              Connect directly with our cross-corpus AI specialists to explore custom scientific literature grounding, patent prior-art indexing, and 3D knowledge universe deployments.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Vance"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  INSTITUTIONAL EMAIL
                </label>
                <input
                  type="email"
                  required
                  placeholder="vance@research-lab.org"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    ORGANIZATION
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="University / Enterprise R&D"
                    className="form-input"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    RESEARCH DOMAIN
                  </label>
                  <select
                    className="form-input"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  >
                    <option value="Biomedicine & Therapeutics">Biomedicine & Therapeutics</option>
                    <option value="Clean Energy & Solid-State">Clean Energy & Solid-State</option>
                    <option value="Quantum Computing & AI">Quantum Computing & AI</option>
                    <option value="Robotics & Autonomous Systems">Robotics & Autonomous</option>
                    <option value="Semiconductors & Materials">Semiconductors & Materials</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-gold"
                style={{ width: '100%', marginTop: '0.75rem', padding: '1rem' }}
              >
                CONFIRM CONSULTATION REQUEST <ArrowUpRight size={17} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
