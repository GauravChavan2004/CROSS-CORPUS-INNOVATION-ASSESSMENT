import React from 'react';
import { BookOpen, ExternalLink, Calendar, User, Database } from 'lucide-react';

export default function PaperResults({ papers }) {
  if (!papers || papers.length === 0) {
    return <div className="glass-panel" style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No research papers retrieved.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {papers.map((paper) => (
        <div key={paper.paper_id} className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="tag tag-teal">{paper.paper_id}</span>
                <span className="tag" style={{ background: paper.source_provider === 'openalex' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)', color: paper.source_provider === 'openalex' ? '#60a5fa' : '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <Database size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {paper.source_provider === 'openalex' ? 'OpenAlex API' : 'Mock Fixture'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                {paper.title}
              </h3>
            </div>
            {paper.source_url && (
              <a
                href={paper.source_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--primary-teal)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
              >
                Link / DOI <ExternalLink size={14} />
              </a>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            {paper.abstract || <em style={{ color: '#94a3b8' }}>Abstract unavailable from paper source.</em>}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} /> {paper.authors && paper.authors.length > 0 ? paper.authors.slice(0, 3).join(', ') : 'Unknown Authors'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} /> {paper.publication_year || 'N/A'}
            </span>
            {paper.doi && (
              <span style={{ color: '#94a3b8' }}>DOI: {paper.doi}</span>
            )}
          </div>

          {paper.keywords && paper.keywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
              {paper.keywords.map((kw, idx) => (
                <span key={idx} className="tag">{kw}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
