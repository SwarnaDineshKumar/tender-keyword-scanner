import React from 'react';
import { Download, CheckSquare, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import RelevanceBadge from './RelevanceBadge';
import { downloadExcelReport } from '../services/api';

export default function ResultsTable({ results, excelBase64, excelFilename }) {
  if (!results || results.length === 0) return null;

  const total = results.length;
  const relatedCount = results.filter((r) => !r.error && (r.relevance === 'Related')).length;
  const possibleCount = results.filter(
    (r) => !r.error && (r.relevance === 'Possibly Related' || r.relevance === 'Possible')
  ).length;
  const notRelatedCount = results.filter((r) => !r.error && (r.relevance === 'Not Related')).length;
  const errorCount = results.filter((r) => Boolean(r.error)).length;

  const handleDownloadExcel = () => {
    if (excelBase64) {
      downloadExcelReport(excelBase64, excelFilename || 'tender_scan_report.xlsx');
    }
  };

  return (
    <div className="card results-card" style={{ marginTop: 24 }}>
      <div className="card-header">
        <h2 className="card-title">
          <CheckSquare size={20} color="var(--primary)" />
          Scan Results & Relevance Summary
        </h2>
        {excelBase64 && (
          <button className="btn btn-success" onClick={handleDownloadExcel}>
            <Download size={16} />
            Download Excel Report (.xlsx)
          </button>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="stats-grid results-stats">
        <div className="stat-card">
          <div className="stat-label">Total Documents</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--rel-related-border)', backgroundColor: '#f0fdf4' }}>
          <div className="stat-label" style={{ color: 'var(--rel-related-text)' }}>Related (3+ matches)</div>
          <div className="stat-value" style={{ color: 'var(--rel-related-text)' }}>{relatedCount}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--rel-possible-border)', backgroundColor: '#fefce8' }}>
          <div className="stat-label" style={{ color: 'var(--rel-possible-text)' }}>Possibly Related (1-2)</div>
          <div className="stat-value" style={{ color: 'var(--rel-possible-text)' }}>{possibleCount}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--rel-not-border)', backgroundColor: '#fef2f2' }}>
          <div className="stat-label" style={{ color: 'var(--rel-not-text)' }}>Not Related (0)</div>
          <div className="stat-value" style={{ color: 'var(--rel-not-text)' }}>{notRelatedCount}</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Matched Keywords</th>
              <th style={{ textAlign: 'center' }}>Match Count</th>
              <th style={{ textAlign: 'center' }}>Relevance to Tritorc</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => {
              if (result.error) {
                return (
                  <tr key={idx}>
                    <td className="doc-name">
                      <FileSpreadsheet size={16} color="#94a3b8" />
                      <span>{result.documentName}</span>
                    </td>
                    <td colSpan={3} style={{ color: '#b91c1c' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={14} />
                        <span>Error: {result.error}</span>
                      </div>
                    </td>
                  </tr>
                );
              }

              const hasKeywords = result.matchedKeywords && result.matchedKeywords.length > 0;

              return (
                <tr key={idx}>
                  <td className="doc-name">
                    <FileSpreadsheet size={16} color="var(--primary)" />
                    <span>{result.documentName}</span>
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
                        <span className="keyword-tag empty">No keywords matched</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>
                    {result.matchCount}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <RelevanceBadge relevance={result.relevance} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
