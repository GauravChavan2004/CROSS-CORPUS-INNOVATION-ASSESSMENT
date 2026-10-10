import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw } from 'lucide-react';

const PRESETS = [
  {
    label: "Drug-Target Affinity (GNN + Attention)",
    text: "Using spatial graph neural networks and dynamic transformer attention to predict drug-target binding affinity with explainable molecular substructure alignment under 3D dynamic thermal fluctuations."
  },
  {
    label: "Cryo-EM Ligand Pose Fitting",
    text: "Real-time transformer-assisted small molecule pose optimization in cryo-electron microscopy density maps addressing flexible side-chain conformation limitations in static patent specifications."
  },
  {
    label: "Quantum High-Throughput Screening",
    text: "Quantum-inspired variational feature maps for virtual screening of large chemical space bypassing NISQ gate noise constraints and patent prior-art barriers."
  }
];

export default function IdeaForm({ onSubmit, loading }) {
  const [ideaText, setIdeaText] = useState(PRESETS[0].text);
  const [topK, setTopK] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    onSubmit({ idea_text: ideaText, top_k: topK });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Sparkles className="icon" style={{ color: 'var(--primary-teal)' }} size={22} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
          Submit Research Idea or Invention Concept
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Research Idea / Technology Problem Statement:
          </label>
          <textarea
            className="form-input"
            rows={4}
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="Describe your research idea, proposed methodology, target application area, or technical constraints..."
            required
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', alignSelf: 'center', marginRight: '0.25rem' }}>
            Quick Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIdeaText(p.text)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Retrieval Depth (Top-K):</label>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              style={{
                background: '#0f172a',
                color: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem'
              }}
            >
              <option value={3}>3 Documents</option>
              <option value={5}>5 Documents</option>
              <option value={10}>10 Documents</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                Executing Pipeline...
              </>
            ) : (
              <>
                <Send size={18} />
                Run Cross-Corpus Innovation Analysis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
