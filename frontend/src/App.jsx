import React, { useState } from 'react';
import { analyzeIdea } from './services/api';
import IdeaForm from './components/IdeaForm';
import PaperResults from './components/PaperResults';
import PatentResults from './components/PatentResults';
import CrossCorpusGraph from './components/CrossCorpusGraph';
import Innovation3DGraph from './components/Innovation3DGraph';
import GapAnalysis from './components/GapAnalysis';
import ScoreBreakdown from './components/ScoreBreakdown';
import OpportunityCards from './components/OpportunityCards';
import EvidencePanel from './components/EvidencePanel';
import { ShieldAlert, Cpu, BookOpen, ShieldCheck, Network, Target, Lightbulb, FileText, Box, Database, AlertTriangle } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalyze = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeIdea(payload);
      setResult(data);
      setActiveTab('overview');
    } catch (err) {
      setError(err.message || 'Pipeline execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 4rem 1.5rem' }}>
      {/* Header */}
      <header className="header-container" style={{ textAlign: 'center' }}>
        <div className="brand-badge">
          <Cpu size={16} /> Evidence-Grounded AI Decision Support System
        </div>
        <h1 className="main-title">
          Cross-Corpus Innovation Assessment & Recommendation
        </h1>
        <p className="subtitle">
          Jointly analyzing scientific papers & patent literature to identify research gaps, prior-art bounds, and explainable innovation opportunities.
        </p>
      </header>

      {/* Idea Form */}
      <IdeaForm onSubmit={handleAnalyze} loading={loading} />

      {/* Error Alert */}
      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '10px', padding: '1rem', color: 'var(--accent-rose)', marginBottom: '1.5rem' }}>
          <strong>Analysis Error:</strong> {error}
        </div>
      )}

      {/* Analysis Results View */}
      {result && (
        <div>
          {/* Parsed Idea Overview Badge */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span className="tag tag-teal" style={{ marginRight: '0.5rem' }}>Analysis ID: {result.analysis_id}</span>
              <span className="tag tag-purple" style={{ marginRight: '0.5rem' }}>Domain: {result.parsed_idea.domain}</span>
              <span className="tag" style={{ background: result.metadata?.data_mode === 'live' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: result.metadata?.data_mode === 'live' ? '#10b981' : '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Database size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {result.metadata?.data_mode === 'live' ? 'Live APIs (OpenAlex & EPO OPS)' : 'Mock Fixture Mode'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Technology: <strong style={{ color: '#fff' }}>{result.parsed_idea.proposed_technology}</strong>
            </div>
          </div>

          {/* Partial Success Warnings Alert */}
          {result.warnings && result.warnings.length > 0 && (
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '1rem', color: '#fbbf24', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <AlertTriangle size={18} /> Provider Execution Warning (Status: {result.status})
              </div>
              <ul style={{ paddingLeft: '1.4rem', margin: 0, fontSize: '0.85rem' }}>
                {result.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab Bar */}
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Lightbulb size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Overview & Recommendations
            </button>
            <button
              className={`tab-btn ${activeTab === '3d-graph' ? 'active' : ''}`}
              onClick={() => setActiveTab('3d-graph')}
            >
              <Box size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> 3D Animated Universe
            </button>
            <button
              className={`tab-btn ${activeTab === 'papers' ? 'active' : ''}`}
              onClick={() => setActiveTab('papers')}
            >
              <BookOpen size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Research Papers ({result.papers.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'patents' ? 'active' : ''}`}
              onClick={() => setActiveTab('patents')}
            >
              <ShieldCheck size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Patent Literature ({result.patents.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
              onClick={() => setActiveTab('graph')}
            >
              <Network size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Cross-Corpus Matrix ({result.relationships.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'gaps' ? 'active' : ''}`}
              onClick={() => setActiveTab('gaps')}
            >
              <Target size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Gap Analysis ({result.gaps.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
              onClick={() => setActiveTab('evidence')}
            >
              <FileText size={16} style={{ display: 'inline', marginRight: '0.4rem' }} /> Evidence Inspector ({result.evidence.length})
            </button>
          </div>

          {/* Tab Content Panels */}
          {activeTab === 'overview' && (
            <div>
              {result.recommendations.length > 0 && result.recommendations[0].assessment_factors && (
                <ScoreBreakdown factors={result.recommendations[0].assessment_factors} />
              )}
              <Innovation3DGraph result={result} />
              <OpportunityCards recommendations={result.recommendations} />
            </div>
          )}

          {activeTab === '3d-graph' && <Innovation3DGraph result={result} />}
          {activeTab === 'papers' && <PaperResults papers={result.papers} />}
          {activeTab === 'patents' && <PatentResults patents={result.patents} />}
          {activeTab === 'graph' && <CrossCorpusGraph relationships={result.relationships} />}
          {activeTab === 'gaps' && <GapAnalysis gaps={result.gaps} />}
          {activeTab === 'evidence' && <EvidencePanel evidence={result.evidence} />}
        </div>
      )}

      {/* Mandatory Prototype Disclaimer Banner */}
      <div className="disclaimer-banner">
        <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Operational & Legal Disclaimer:</strong> The system is a research and decision-support prototype. It MUST NOT claim to establish legal patentability, legal freedom to operate, automated patent filing, or guaranteed commercial success. It clearly distinguishes preliminary computational assessments from decisions requiring legal, technical, intellectual-property, or commercial expertise.
        </div>
      </div>
    </div>
  );
}
