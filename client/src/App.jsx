import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import KeywordList from './components/KeywordList';
import { fetchHealth, fetchKeywords, scanDocuments } from './services/api';
import { AlertCircle } from 'lucide-react';
import './App.css';

export default function App() {
  const [keywords, setKeywords] = useState([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(true);
  const [isServerHealthy, setIsServerHealthy] = useState(true);
  const [files, setFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchHealth()
        .then(() => setIsServerHealthy(true))
        .catch(() => setIsServerHealthy(false)),
      fetchKeywords()
        .then((data) => setKeywords(data.keywords || []))
        .catch((err) => console.error('Failed to load keywords:', err)),
    ]).finally(() => {
      setIsLoadingKeywords(false);
    });
  }, []);

  const handleScan = async () => {
    if (files.length === 0) return;

    setIsScanning(true);
    setError('');
    try {
      const response = await scanDocuments(files);
      setScanData(response);

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('scan-results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError(err.message || 'An error occurred while scanning files.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setScanData(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      <Header
        keywordCount={keywords.length}
        isServerHealthy={isServerHealthy}
      />

      <main className="app-container">
        <div className="main-grid">
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            onScan={handleScan}
            isScanning={isScanning}
          />

          {error && (
            <div className="alert-banner alert-error" role="alert">
              <AlertCircle size={20} />
              <div>
                <strong>Scan Request Failed:</strong> {error}
              </div>
            </div>
          )}

          {scanData && (
            <ResultsTable
              results={scanData.results}
              excelBase64={scanData.excelBase64}
              excelFilename={scanData.excelFilename}
              onReset={handleReset}
            />
          )}

          <KeywordList
            keywords={keywords}
            isLoading={isLoadingKeywords}
          />
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <span>Tender & Scope-of-Work Keyword Scanner &bull; Tritorc Relevance Screener</span>
          <span>Deterministic Matching Engine &bull; Excel (.xlsx) Export</span>
        </div>
      </footer>
    </div>
  );
}
