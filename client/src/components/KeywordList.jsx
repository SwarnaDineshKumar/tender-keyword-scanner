import React, { useState, useMemo } from 'react';
import { Tag, ChevronDown, ChevronUp, Search, Check, ListFilter } from 'lucide-react';

export default function KeywordList({ keywords = [], isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return keywords;
    return keywords.filter((k) => k.toLowerCase().includes(search.toLowerCase().trim()));
  }, [keywords, search]);

  return (
    <div className="card keywords-panel">
      <div
        className="card-header keywords-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label="Toggle configured keywords catalog"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="card-title">
          <Tag size={18} color="var(--primary)" />
          <span>Configured Scanning Keywords</span>
          <span className="count-pill">
            {isLoading ? 'Loading...' : `${keywords.length} active`}
          </span>
        </div>
        <div className="toggle-indicator">
          <span className="toggle-text">{isOpen ? 'Hide list' : 'View list'}</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isOpen && (
        <div className="keywords-content">
          <div className="keywords-meta-bar">
            <p className="keywords-description">
              Documents are scanned against these 20 preconfigured Tritorc industry terms (case-insensitive with singular/plural & variant matching):
            </p>
            <div className="keyword-search-wrap">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="keyword-search-input"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="keywords-list-grid">
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 0' }}>
                No keywords match "{search}".
              </p>
            ) : (
              filtered.map((kw, i) => (
                <div key={i} className="keyword-list-item">
                  <span className="keyword-idx">{i + 1}</span>
                  <span className="keyword-text">{kw}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
