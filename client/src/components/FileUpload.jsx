import React, { useRef, useState } from 'react';
import { Upload, FileText, X, AlertTriangle, FilePlus2, LoaderCircle, ArrowRight } from 'lucide-react';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
        if (!files.some((f) => f.name === file.name && f.size === file.size)) valid.push(file);
      } else invalid.push(file.name);
    }
    if (invalid.length) setErrorMsg(`Unsupported files ignored (only PDF and DOCX allowed): ${invalid.join(', ')}`);
    if (valid.length) onFilesChange([...files, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragOver(false);
    if (e.dataTransfer.files?.length) validateAndAddFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="upload-panel">
      <div className="upload-panel-head">
        <div>
          <span className="panel-kicker">DOCUMENT INPUT</span>
          <h3>Upload tender documents</h3>
        </div>
        {files.length > 0 && (
          <button className="text-button" onClick={() => onFilesChange([])} disabled={isScanning}>Clear selection</button>
        )}
      </div>

      <div
        className={`dropzone ${isDragOver ? 'active' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.length) validateAndAddFiles(Array.from(e.target.files)); e.target.value = ''; }} />
        <div className="upload-illustration"><FilePlus2 size={31} strokeWidth={1.8} /><span>+</span></div>
        <h4>{isDragOver ? 'Drop documents here' : 'Add tender or SOW documents'}</h4>
        <p>Drag & drop files here, or <strong>browse from your computer</strong></p>
        <div className="file-types"><span>PDF</span><span>DOCX</span><b>Up to 15 MB each</b></div>
      </div>

      {errorMsg && <div className="inline-error"><AlertTriangle size={17} /><span>{errorMsg}</span></div>}

      <div className="selection-area">
        <div className="selection-heading">
          <span>SELECTED DOCUMENTS</span>
          <b>{files.length}</b>
        </div>
        {files.length === 0 ? (
          <div className="empty-selection">Your selected files will appear here before scanning.</div>
        ) : (
          <div className="file-list">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="file-item">
                <div className="file-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="file-icon"><FileText size={20} /></div>
                <div className="file-details">
                  <strong title={file.name}>{file.name}</strong>
                  <span>{formatBytes(file.size)} · Ready to scan</span>
                </div>
                <button className="remove-file-btn" type="button" onClick={() => onFilesChange(files.filter((_, i) => i !== index))} disabled={isScanning} title="Remove file"><X size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="scan-footer">
        <div className="scan-explainer">
          <span className="scan-dot"></span>
          <span>{files.length ? `${files.length} document${files.length > 1 ? 's' : ''} ready for screening` : 'Add at least one document to begin'}</span>
        </div>
        <button className="scan-button" onClick={onScan} disabled={isScanning || !files.length}>
          {isScanning ? <><LoaderCircle className="spin" size={20} /> Scanning documents...</> : <>Scan documents <ArrowRight size={20} /></>}
        </button>
      </div>
    </div>
  );
}
