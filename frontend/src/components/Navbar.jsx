import React from 'react';
import { Sun, Moon, ArrowUpRight, Compass, Sparkles } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, onOpenConsultation, onNavigateToAssessment, onNavigateTo3D }) {
  return (
    <nav className="navbar-container">
      {/* Brand Logo matching Indoglobal luxury style */}
      <div 
        className="brand-logo-wrap"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <img 
          src="/logo.png" 
          alt="Cross-Corpus Innovation Assessment and Recommendation" 
          style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Nav Menu Links */}
      <ul className="nav-links">
        <li>
          <a href="#about" className="nav-link">About</a>
        </li>
        <li>
          <a href="#why" className="nav-link">Why Dual-Corpus</a>
        </li>
        <li>
          <a href="#modules" className="nav-link">Core Modules</a>
        </li>
        <li>
          <a href="#environments" className="nav-link">3-Environments</a>
        </li>
        <li>
          <a 
            href="#3d-universe" 
            className="nav-link" 
            onClick={(e) => {
              e.preventDefault();
              onNavigateTo3D();
            }}
          >
            3D Animations
          </a>
        </li>
        <li>
          <a 
            href="#live-assessment" 
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToAssessment();
            }}
          >
            Live Engine
          </a>
        </li>
      </ul>

      {/* Right Controls: Theme Toggle & Schedule Consultation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-main)',
            transition: 'all 0.2s ease'
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button 
          onClick={onOpenConsultation}
          className="btn-gold"
          style={{ padding: '0.65rem 1.4rem', fontSize: '0.82rem' }}
        >
          SCHEDULE CONSULTATION <ArrowUpRight size={15} />
        </button>
      </div>
    </nav>
  );
}
