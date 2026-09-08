import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function KeywordList({ keywords, isLoading }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="keyword-section">
      <button className="keyword-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span>{isOpen ? 'Hide keyword list' : 'View keyword list'}</span>
        {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {isOpen && (
        <div className="keyword-list">
          {keywords.map((kw, i) => (
            <div key={i} className="keyword-row"><span>{String(i + 1).padStart(2, '0')}</span><strong>{kw}</strong></div>
          ))}
          {isLoading && <div className="keyword-loading">Loading configured keywords...</div>}
        </div>
      )}
    </div>
  );
}
