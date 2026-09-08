import React from 'react';
import { Search, CircleCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-mark"><Search size={23} strokeWidth={2.4} /></div>
          <div>
            <h1 className="brand-title">Tritorc</h1>
            <p className="brand-subtitle">Tender Keyword Scanner</p>
          </div>
        </div>
        <div className="header-status"><CircleCheck size={17} /> Scanner ready</div>
      </div>
    </header>
  );
}
