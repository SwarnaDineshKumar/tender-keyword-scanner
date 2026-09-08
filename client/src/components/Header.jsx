import React from 'react';
import { Search, CheckCircle, Cpu } from 'lucide-react';

export default function Header({ keywordCount = 20, isServerHealthy = true }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon">
            <Search size={24} />
          </div>
          <div>
            <h1 className="brand-title">Tritorc Tender Keyword Scanner</h1>
            <p className="brand-subtitle">Automated Scope-of-Work & Tender Relevance Screening</p>
          </div>
        </div>
        <div className="header-badges">
          <span className="header-badge">
            <Cpu size={14} />
            Deterministic Matcher
          </span>
          <span className="header-badge health">
            <CheckCircle size={14} color="#16a34a" />
            {keywordCount} Keywords Configured
          </span>
        </div>
      </div>
    </header>
  );
}
