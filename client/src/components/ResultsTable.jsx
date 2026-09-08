import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Hash,
  FileText,
  Info,
  Layers,
} from 'lucide-react';
import RelevanceBadge from './RelevanceBadge';
import { downloadExcelReport } from '../services/api';

export default function ResultsTable({ results, excelBase64, excelFilename, onReset }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelevance, setFilterRelevance] = useState('ALL');

  if (!results || results.length === 0) return null;

  const total = results.length;
  const relatedCount = results.filter((r) => !r.error && r.relevance === 'Related').length;
  const possibleCount = results.filter(
    (r) => !r.error && (r.relevance === 'Possibly Related' || r.relevance === 'Possible')
  ).length;
  const notRelatedCount = results.filter((r) => !r.error && r.relevance === 'Not Related').length;
  const errorCount = results.filter((r) => Boolean(r.error)).length;

  const totalKeywordHits = results.reduce(
    (acc, curr) => acc + (curr.matchCount || 0),
    0
  );

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        r.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.matchedKeywords &&
          r.matchedKeywords.some((kw) => kw.toLowerCase().includes(searchTerm.toLowerCase())));

      if (!matchesSearch) return false;

      if (filterRelevance === 'ALL') return true;
      if (filterRelevance === 'RELATED') return r.relevance === 'Related';
      if (filterRelevance === 'POSSIBLY')
        return r.relevance === 'Possibly Related' || r.relevance === 'Possible';
      if (filterRelevance === 'NOT') return r.relevance === 'Not Related';
      return true;
    });
  }, [results, searchTerm, filterRelevance]);

  const handleDownloadExcel = () => {
    if (excelBase64) {
      downloadExcelReport(excelBase64, excelFilename || 'tender_scan_report.xlsx');
    }
  };

  return (
    <div className="card results-card" id="scan-results-section">
      {/* Header with Title and Actions */}
      <div className="card-header results-header">
        <div>
          <h2 className="card-title">
            <FileSpreadsheet size={22} color="var(--primary)" />
            <span>Scan Results & Relevance Report</span>
          </h2>
          <p className="card-subtitle">
            Processed {total} document{total > 1 ? 's' : ''} with deterministic keyword matching and relevance scoring.
          </p>
        </div>

        <div className="results-actions">
          {excelBase64 && (
            <button
              className="btn btn-success"
              onClick={handleDownloadExcel}
              title="Download results as formatted Excel workbook"
            >
              <Download size={16} />
              <span>Download Excel Report (.xlsx)</span>
            </button>
          )}

          {onReset && (
            <button
              className="btn btn-secondary"
              onClick={onReset}
              title="Clear results and start a new scan"
            >
              <RotateCcw size={16} />
              <span>Start New Scan</span>
            </button>
          )}
        </div>
      </div>

      {/* Relevance Criteria Legend */}
      <div className="relevance-legend">
        <div className="legend-title">
          <Info size={14} />
          <span>Dynamic Scoring Thresholds:</span>
        </div>
        <div className="legend-items">
          <span className="legend-item">
            <span className="legend-dot dot-related"></span>
            <strong>3+ Matches:</strong> Related (High Bolting Intent)
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-possible"></span>
            <strong>1–2 Matches:</strong> Possibly Related (Review Needed)
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-not"></span>
            <strong>0 Matches:</strong> Not Related
          </span>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap bg-blue">
            <Layers size={18} color="var(--primary)" />
          </div>
          <div>
            <div className="stat-label">Total Documents</div>
            <div className="stat-value">{total}</div>
          </div>
        </div>

        <div className="stat-card stat-related">
          <div className="stat-icon-wrap bg-green">
            <CheckCircle2 size={18} color="var(--rel-related-text)" />
          </div>
          <div>
            <div className="stat-label">Related (3+)</div>
            <div className="stat-value">{relatedCount}</div>
          </div>
        </div>

        <div className="stat-card stat-possible">
          <div className="stat-icon-wrap bg-yellow">
            <AlertCircle size={18} color="var(--rel-possible-text)" />
          </div>
          <div>
            <div className="stat-label">Possibly Related (1–2)</div>
            <div className="stat-value">{possibleCount}</div>
          </div>
        </div>

        <div className="stat-card stat-not">
          <div className="stat-icon-wrap bg-red">
            <XCircle size={18} color="var(--rel-not-text)" />
          </div>
          <div>
            <div className="stat-label">Not Related (0)</div>
            <div className="stat-value">{notRelatedCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap bg-purple">
            <Hash size={18} color="#6b21a8" />
          </div>
          <div>
            <div className="stat-label">Total Keyword Hits</div>
            <div className="stat-value">{totalKeywordHits}</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="table-controls-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Filter by document name or matched keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterRelevance === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterRelevance('ALL')}
          >
            All ({total})
          </button>
          <button
            className={`filter-btn ${filterRelevance === 'RELATED' ? 'active' : ''}`}
            onClick={() => setFilterRelevance('RELATED')}
          >
            Related ({relatedCount})
          </button>
          <button
            className={`filter-btn ${filterRelevance === 'POSSIBLY' ? 'active' : ''}`}
            onClick={() => setFilterRelevance('POSSIBLY')}
          >
            Possibly ({possibleCount})
          </button>
          <button
            className={`filter-btn ${filterRelevance === 'NOT' ? 'active' : ''}`}
            onClick={() => setFilterRelevance('NOT')}
          >
            Not Related ({notRelatedCount})
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th style={{ width: '32%' }}>Document Name</th>
              <th style={{ width: '42%' }}>Matched Keywords</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Match Count</th>
              <th style={{ width: '14%', textAlign: 'center' }}>Relevance to Tritorc</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={4} className="no-matches-cell">
                  No documents match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredResults.map((result, idx) => {
                if (result.error) {
                  return (
                    <tr key={idx} className="error-row">
                      <td className="doc-name">
                        <FileText size={16} color="#94a3b8" />
                        <span title={result.documentName}>{result.documentName}</span>
                      </td>
                      <td colSpan={3} className="error-message-cell">
                        <AlertCircle size={15} />
                        <span>Error processing file: {result.error}</span>
                      </td>
                    </tr>
                  );
                }

                const hasKeywords = result.matchedKeywords && result.matchedKeywords.length > 0;
                const isPdf = result.documentName.toLowerCase().endsWith('.pdf');

                return (
                  <tr key={idx} className={`result-row ${result.relevance.toLowerCase().replace(/\s+/g, '-')}`}>
                    <td className="doc-name">
                      <span className={`file-ext-tag small ${isPdf ? 'pdf' : 'docx'}`}>
                        {isPdf ? 'PDF' : 'DOCX'}
                      </span>
                      <span className="doc-name-text" title={result.documentName}>
                        {result.documentName}
                      </span>
                    </td>
                    <td>
                      <div className="keywords-tags">
                        {hasKeywords ? (
                          result.matchedKeywords.map((kw, kIdx) => (
                            <span key={kIdx} className="keyword-tag">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="keyword-tag empty">(none found)</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`count-badge count-${result.matchCount > 2 ? 'high' : result.matchCount > 0 ? 'mid' : 'zero'}`}>
                        {result.matchCount}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <RelevanceBadge relevance={result.relevance} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
