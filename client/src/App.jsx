import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import KeywordList from './components/KeywordList';
import {
  fetchKeywords,
  scanDocuments,
  fetchScanHistory,
} from './services/api';
import {
  AlertCircle,
  FileSearch,
  ListChecks,
  History,
} from 'lucide-react';
import './App.css';

export default function App() {
  const [keywords, setKeywords] = useState([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(true);

  const [files, setFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState(null);

  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    fetchKeywords()
      .then((data) => setKeywords(data.keywords || []))
      .catch((err) => console.error('Failed to load keywords:', err))
      .finally(() => setIsLoadingKeywords(false));
  }, []);

  useEffect(() => {
    fetchScanHistory()
      .then((data) => setHistory(data.history || []))
      .catch((err) => console.error('Failed to load scan history:', err))
      .finally(() => setIsLoadingHistory(false));
  }, []);

  const handleScan = async () => {
    if (!files.length) return;

    setIsScanning(true);
    setError('');

    try {
      const response = await scanDocuments(files);

      setScanData(response);

      // Refresh history after a successful scan so the new
      // records saved in MongoDB appear immediately.
      try {
        const historyResponse = await fetchScanHistory();
        setHistory(historyResponse.history || []);
      } catch (historyError) {
        console.error(
          'Scan completed, but history could not be refreshed:',
          historyError
        );
      }
    } catch (err) {
      setError(err.message || 'An error occurred while scanning files.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="app-shell">
      <Header />

      <main className="app-container">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="section-kicker">
              <span>01</span> TENDER SCREENING
            </div>

            <h2>
              Find the tenders that
              <br />
              <em>matter to Tritorc.</em>
            </h2>

            <p>
              Upload tender or scope-of-work documents. The scanner extracts
              the text, checks it against Tritorc's configured bolting
              keywords, and ranks each document by relevance.
            </p>
          </div>

          <div className="how-it-works" aria-label="Scanning process">
            <div className="process-title">HOW IT WORKS</div>

            <div className="process-row">
              <span>
                <b>01</b> Upload
              </span>
              <i>→</i>

              <span>
                <b>02</b> Extract
              </span>
              <i>→</i>

              <span>
                <b>03</b> Match
              </span>
              <i>→</i>

              <span>
                <b>04</b> Report
              </span>
            </div>
          </div>
        </section>

        <section className="screening-layout">
          <div className="primary-column">
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              onScan={handleScan}
              isScanning={isScanning}
            />
          </div>

          <aside className="criteria-column">
            <div className="criteria-panel">
              <div className="panel-heading">
                <div className="panel-icon">
                  <ListChecks size={20} />
                </div>

                <div>
                  <span className="panel-kicker">SCAN CRITERIA</span>
                  <h3>What are we looking for?</h3>
                </div>
              </div>

              <p className="criteria-copy">
                Every uploaded document is checked against these
                Tritorc-relevant industry terms.
              </p>

              <div className="criteria-count">
                <strong>
                  {isLoadingKeywords ? '—' : keywords.length}
                </strong>
                <span>active keywords</span>
              </div>

              <KeywordList
                keywords={keywords}
                isLoading={isLoadingKeywords}
              />
            </div>

            <div className="method-note">
              <FileSearch size={18} />

              <div>
                <strong>Deterministic matching</strong>

                <p>
                  Case-insensitive keyword matching with simple
                  singular/plural variants. No AI is used to decide
                  relevance.
                </p>
              </div>
            </div>
          </aside>
        </section>

        {error && (
          <div className="error-banner">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {scanData && (
          <ResultsTable
            results={scanData.results}
            excelBase64={scanData.excelBase64}
            excelFilename={scanData.excelFilename}
          />
        )}

        <section className="history-section">
          <div className="history-header">
            <div className="history-title-group">
              <div className="panel-icon">
                <History size={20} />
              </div>

              <div>
                <span className="panel-kicker">SCAN HISTORY</span>
                <h3>Previous screening results</h3>
              </div>
            </div>

            <span className="history-count">
              {history.length} record{history.length === 1 ? '' : 's'}
            </span>
          </div>

          {isLoadingHistory ? (
            <div className="history-empty">
              Loading scan history...
            </div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              No previous scans found.
            </div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Matched Keywords</th>
                    <th>Matches</th>
                    <th>Relevance</th>
                    <th>Scanned At</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr key={item._id}>
                      <td className="history-document">
                        {item.documentName}
                      </td>

                      <td>
                        {item.matchedKeywords?.length
                          ? item.matchedKeywords.join(', ')
                          : 'None'}
                      </td>

                      <td>{item.matchCount}</td>

                      <td>
                        <span
                          className={`history-relevance ${
                            item.relevance
                              ?.toLowerCase()
                              .replace(/\s+/g, '-')
                          }`}
                        >
                          {item.relevance}
                        </span>
                      </td>

                      <td>
                        {item.scannedAt
                          ? new Date(item.scannedAt).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}