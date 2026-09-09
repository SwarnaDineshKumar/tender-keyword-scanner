/**
 * REST API client for Tender Keyword Scanner
 */

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);

  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchKeywords() {
  const res = await fetch(`${API_BASE}/keywords`);

  if (!res.ok) {
    throw new Error(`Failed to load keywords: ${res.statusText}`);
  }

  return res.json();
}

export async function scanDocuments(files) {
  const formData = new FormData();

  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Scan failed: ${res.statusText}`);
  }

  return data;
}

export async function fetchScanHistory() {
  const res = await fetch(`${API_BASE}/history`);

  if (!res.ok) {
    throw new Error(`Failed to load scan history: ${res.statusText}`);
  }

  return res.json();
}

export function downloadExcelReport(
  base64Data,
  filename = 'tender_scan_report.xlsx'
) {
  if (!base64Data) return;

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}