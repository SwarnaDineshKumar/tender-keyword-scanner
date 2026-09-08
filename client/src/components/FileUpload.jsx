import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertTriangle, Loader2, FileCheck, Layers } from 'lucide-react';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileExtension(filename = '') {
  return filename.split('.').pop().toUpperCase();
}

export default function FileUpload({ files, onFilesChange, onScan, isScanning }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const allowedExtensions = ['.pdf', '.docx'];

  const validateAndAddFiles = (incomingFiles) => {
    setErrorMsg('');
    const valid = [];
    const invalid = [];

    for (const file of incomingFiles) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (allowedExtensions.includes(ext)) {
        if (!files.some((f) => f.name === file.name && f.size === file.size)) {
          valid.push(file);
        }
      } else {
        invalid.push(file.name);
      }
    }

    if (invalid.length > 0) {
      setErrorMsg(`Unsupported file type ignored: ${invalid.join(', ')}. Only .pdf and .docx are supported.`);
    }

    if (valid.length > 0) {
      onFilesChange([...files, ...valid]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const removeFile = (index) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    onFilesChange([]);
    setErrorMsg('');
  };

  return (
    <div className="card upload-card">
      <div className="card-header">
        <h2 className="card-title">
          <UploadCloud size={20} color="var(--primary)" />
          <span>Upload Tender / SOW Documents</span>
        </h2>
        {files.length > 0 && !isScanning && (
          <button className="btn btn-secondary btn-sm" onClick={clearAll} title="Clear selected files">
            Clear All
          </button>
        )}
      </div>

      <div
        className={`dropzone ${isDragOver ? 'active' : ''} ${isScanning ? 'disabled' : ''}`}
        onDrop={isScanning ? undefined : handleDrop}
        onDragOver={isScanning ? undefined : handleDragOver}
        onDragLeave={isScanning ? undefined : handleDragLeave}
        onClick={() => !isScanning && fileInputRef.current && fileInputRef.current.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF or DOCX documents"
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isScanning) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          style={{ display: 'none' }}
          onChange={handleFileInput}
          disabled={isScanning}
        />
        <div className="dropzone-icon-wrap">
          <UploadCloud className="dropzone-icon" />
        </div>
        <p className="dropzone-text">Click to choose files or drag & drop here</p>
        <p className="dropzone-hint">
          Supported formats: <strong>.PDF</strong> and <strong>.DOCX</strong> (up to 15MB each, multi-file upload enabled)
        </p>
        <div className="format-pills">
          <span className="pill pill-pdf">PDF</span>
          <span className="pill pill-docx">DOCX</span>
          <span className="pill pill-multi">Multi-file</span>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-banner alert-error" role="alert">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected files preview */}
      {files.length > 0 && (
        <div className="selected-files-section">
          <div className="section-label-row">
            <span className="section-label">
              <FileCheck size={16} /> Selected Documents ({files.length}):
            </span>
            <span className="section-sub">Ready to scan against Tritorc keywords</span>
          </div>

          <div className="file-list">
            {files.map((file, index) => {
              const ext = getFileExtension(file.name);
              return (
                <div key={`${file.name}-${index}`} className="file-item">
                  <div className="file-item-left">
                    <span className={`file-ext-tag ${ext.toLowerCase()}`}>{ext}</span>
                    <div className="file-item-meta">
                      <span className="file-item-name" title={file.name}>{file.name}</span>
                      <span className="file-item-size">{formatBytes(file.size)}</span>
                    </div>
                  </div>
                  {!isScanning && (
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                      title={`Remove ${file.name}`}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="actions-row">
            <button
              className="btn btn-primary btn-lg"
              onClick={onScan}
              disabled={isScanning || files.length === 0}
            >
              {isScanning ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Scanning {files.length} Document{files.length > 1 ? 's' : ''}...</span>
                </>
              ) : (
                <>
                  <Layers size={18} />
                  <span>Scan {files.length} Document{files.length > 1 ? 's' : ''} for Keywords</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Scanning progress banner */}
      {isScanning && (
        <div className="scanning-progress-banner">
          <div className="scanning-spinner">
            <Loader2 size={24} className="spin-icon" />
          </div>
          <div className="scanning-text">
            <h4>Extracting text & matching keywords...</h4>
            <p>Scanning documents against 20 configured bolting and flange management keywords, calculating relevance, and building the Excel report.</p>
          </div>
        </div>
      )}
    </div>
  );
}
