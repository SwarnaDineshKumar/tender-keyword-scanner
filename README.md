# Tender / Scope-of-Work Keyword Scanner

An automated full-stack web application designed for **Tritorc's** sales and engineering bid estimation team. The application automatically ingests and screens tender documents and Scope of Work (SOW) files (PDF and DOCX) against a configurable catalog of bolting, machining, and flange management keywords, computes dynamic relevance ratings, and generates styled, downloadable Excel (.xlsx) reports.

---

## What the Application Does

Tritorc regularly receives large tender packages and complex SOW documents from EPC contractors, refinery operators, and asset owners. Manually skimming each 50-to-200-page document to check whether it contains mechanical bolting, flange management, or torque tool requirements is slow and error-prone.

This tool automates that pre-bid qualification:
1. Users upload one or more tender files (`.pdf` and `.docx`).
2. The backend extracts text in-memory using `pdf-parse` (PDF) and `mammoth` (DOCX).
3. A deterministic, rules-based engine scans the extracted text for configured industry keywords with full singular/plural and verb variant support.
4. Each document receives a dynamic relevance verdict (*Related*, *Possibly Related*, or *Not Related*) based on configurable match thresholds.
5. The frontend displays summary statistics and an interactive results table.
6. Users can download a formatted Excel spreadsheet summarizing all scanned documents.

---

## Key Features

- **Multi-Document Ingestion**: Upload multiple `.pdf` and `.docx` files simultaneously with drag-and-drop or file selection.
- **Deterministic Keyword Engine**: 100% rules-based, case-insensitive phrase matching with word-boundary lookarounds and stemming (no AI/LLM hallucinations or non-deterministic variance).
- **Subword False-Positive Prevention**: Ensures substrings inside unrelated words (e.g. `donut splitter`) do not falsely trigger keyword hits (`Nut splitter`).
- **Singular/Plural & Variant Tolerance**: Automatically handles plural forms (`-s`, `-es`, `-ies`) and engineering verb forms (`tensioning` / `tensioned`, `tightening` / `tightened`, `bolting` / `bolted`).
- **Distinct Keyword Counting**: Repeated mentions of the same keyword in a document count as 1 distinct match, avoiding artificial score inflation.
- **Dynamic & Configurable Relevance**: Evaluates relevance based on configurable thresholds without hardcoded rules.
- **Styled Excel Export (.xlsx)**: Generates a downloadable Excel report with formatted headers, auto-fit column widths, and color-coded status fills.
- **Fault-Tolerant Processing**: Individual file failures or unsupported formats in a batch do not halt the scanning of other valid documents.
- **Interactive UI**: Includes search and filter controls, summary statistic cards, an expandable keyword catalog viewer, and a 1-click "Start New Scan" action.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Component architecture, responsive client interface, local dev proxy |
| **Icons & Styling** | Lucide React, Custom CSS Design Tokens | Industrial engineering UI aesthetic, responsive mobile/desktop layout |
| **Backend** | Node.js (>=18), Express | REST API, multipart file ingestion, batch orchestration |
| **File Handling** | Multer (Memory Storage) | In-memory stream handling for uploaded files |
| **PDF Extraction** | `pdf-parse` | Buffer-level text extraction from binary PDF streams |
| **DOCX Extraction** | `mammoth` | Raw text extraction from OpenXML Word documents |
| **Excel Generation**| `exceljs` | Automated creation and formatting of `.xlsx` workbooks |
| **Testing** | Node.js Built-in Test Runner (`node:test`) | Unit and integration test suite |

---

## Project Structure

```
tender-keyword-scanner/
├── client/                     # Frontend React application (Vite)
│   ├── src/
│   │   ├── components/         # Modular UI components
│   │   │   ├── FileUpload.jsx  # Drag-and-drop upload zone, format pills, staging list
│   │   │   ├── ResultsTable.jsx# Results table, search/filter, stats, Excel download action
│   │   │   ├── RelevanceBadge.jsx # Color-coded relevance status badges
│   │   │   ├── KeywordList.jsx # Collapsible active keyword catalog with search
│   │   │   └── Header.jsx      # Tritorc branding and system status indicator
│   │   ├── services/
│   │   │   └── api.js          # REST client (/api/scan, /api/keywords, /api/health) & Excel downloader
│   │   ├── App.jsx             # Main dashboard state orchestration
│   │   ├── App.css             # Layout, animations, cards, badges, and responsive CSS
│   │   ├── index.css           # Global typography, color tokens, and resets
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML template with Inter typography
│   ├── vite.config.js          # Vite configuration with /api proxy to port 4000
│   └── package.json
│
├── server/                     # Backend Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js          # Port & file size limit settings
│   │   │   ├── keywords.json   # 20 default Tritorc industry keywords
│   │   │   └── relevance.js    # Configurable relevance thresholds
│   │   ├── controllers/
│   │   │   └── scan.controller.js  # Request handlers (/scan, /keywords, /health)
│   │   ├── middleware/
│   │   │   └── upload.js       # Multer configuration for .pdf and .docx
│   │   ├── routes/
│   │   │   └── scan.routes.js  # REST API route mapping
│   │   ├── services/
│   │   │   ├── extractText.service.js   # PDF and DOCX text extraction
│   │   │   ├── matchKeywords.service.js # Deterministic keyword matcher
│   │   │   ├── scoreRelevance.service.js# Dynamic relevance scoring
│   │   │   ├── excel.service.js         # Excel (.xlsx) workbook builder
│   │   │   └── extractFields.service.js # Metadata/field parser
│   │   ├── utils/
│   │   │   └── keywords.js     # Keyword file loader
│   │   └── index.js            # Express server entry point
│   ├── test/                   # Automated backend test suite
│   │   ├── apiScan.test.js     # End-to-end HTTP API tests
│   │   ├── keywordMatching.test.js # Regex, boundary & stemming tests
│   │   ├── extraction.test.js  # PDF & DOCX extraction tests
│   │   ├── relevance.test.js   # Scoring threshold tests
│   │   └── excel.test.js       # Excel workbook structure tests
│   ├── .env.example
│   ├── .env                    # Local environment variables
│   └── package.json
│
├── sample-documents/           # Real GeM tender sample PDFs for verification
├── package.json                # Root convenience scripts
├── AI_NOTES.txt                # AI usage and prompt documentation
├── DEPLOY.md                   # Deployment architecture guide
└── README.md                   # Project documentation
```

---

## Prerequisites

- **Node.js**: Version `18.0.0` or higher (tested on Node `v20.19.5`)
- **npm**: Version `9.0.0` or higher (tested on npm `10.8.2`)

---

## Installation & Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd tender-keyword-scanner
   ```

2. **Install all dependencies (both root, server, and client)**:
   ```bash
   npm run install:all
   ```
   *Alternatively, install each workspace individually:*
   ```bash
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

---

## Environment Variables

The backend configuration lives in `server/.env` (a template is provided in `server/.env.example`):

```env
PORT=4000
```

- `PORT`: The local HTTP port the Express server listens on (default: `4000`).

---

## How to Run

### 1. Start Backend Server
```bash
npm run server
# Server starts on http://localhost:4000 with --watch mode enabled
```

### 2. Start Frontend Client
```bash
npm run client
# Vite development server starts on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser. The Vite dev server proxies all `/api/*` requests directly to `http://localhost:4000`.

### 3. Run Automated Tests
```bash
npm test
# Executes the complete 20-test automated suite using node:test
```

### 4. Build for Production
```bash
npm run build
# Compiles frontend assets into client/dist
```

---

## API Endpoints

### 1. `GET /api/health`
Checks server health and uptime.
- **Response**: `200 OK`
  ```json
  {
    "status": "ok",
    "uptime": 12.45,
    "timestamp": "2026-09-09T00:00:00.000Z"
  }
  ```

### 2. `GET /api/keywords`
Fetches the active configured list of screening keywords.
- **Response**: `200 OK`
  ```json
  {
    "keywords": [
      "Hydraulic torque wrench",
      "Bolt tensioner",
      "Hydraulic bolt tensioning",
      "Controlled bolting",
      "Flange management",
      ...
    ]
  }
  ```

### 3. `POST /api/scan`
Uploads one or more documents for text extraction, keyword scanning, relevance evaluation, and Excel report generation.
- **Request**: `multipart/form-data`
  - Field: `files` (array of file blobs, `.pdf` or `.docx`, up to 10 files, max 15MB each).
- **Response**: `200 OK`
  ```json
  {
    "batchId": "7c26ecb9-a0d0-488b-a51f-844cfc9dd8e0",
    "results": [
      {
        "documentName": "GeM-Bidding-9649647.pdf",
        "matchedKeywords": ["Hydraulic torque wrench", "Torque wrench"],
        "matchedKeywordsDisplay": "Hydraulic torque wrench, Torque wrench",
        "matchCount": 2,
        "relevance": "Possibly Related"
      }
    ],
    "excelBase64": "UEsDBBQAAAAIA...",
    "excelFilename": "tender_scan_report_1788894333382.xlsx"
  }
  ```
- **Error Response**: `400 Bad Request` if no files are provided or field name is incorrect.

---

## How Keyword Matching & Relevance Scoring Work

### Deterministic Keyword Matching
Keyword matching is implemented purely in deterministic JavaScript code ([matchKeywords.service.js](file:///c:/Users/dines/OneDrive/Desktop/tender-keyword-scanner/server/src/services/matchKeywords.service.js)) without any external AI or LLM API calls:
1. **Normalization**: Input text is lowercased and collapsed into single whitespace delimiters.
2. **Word-Boundary Lookarounds**: Regular expressions use `(?<![a-zA-Z0-9])` and `(?![a-zA-Z0-9])` to guarantee that keywords only match whole words. For example, `"donut splitter"` will never match `"Nut splitter"`.
3. **Singular/Plural & Stem Variants**: The engine varies the terminal word of each keyword phrase across common English plural patterns (`-s`, `-es`, `-ies`) and engineering participle forms (`-ing` $\leftrightarrow$ `-ed`, `-ings`).
4. **Hyphen & Spacing Tolerance**: Hyphenated terms like `Pre-tensioning` match both `pre-tensioning` and `pre tensioning`.
5. **Length-Priority Precedence**: Keywords are sorted longest-first. When a specific phrase like `"Hydraulic torque wrench"` matches, its matched span is blanked out so the shorter sub-phrase `"Torque wrench"` does not double-count on the exact same phrase occurrence.
6. **Distinct Keyword Counting**: If `"Bolt tensioner"` appears 5 times in a document, it is counted once in `matchedKeywords` (`matchCount = 1`).

### Dynamic Relevance Scoring
Relevance is scored dynamically from the distinct keyword match count ([scoreRelevance.service.js](file:///c:/Users/dines/OneDrive/Desktop/tender-keyword-scanner/server/src/services/scoreRelevance.service.js)) against configurable thresholds ([relevance.js](file:///c:/Users/dines/OneDrive/Desktop/tender-keyword-scanner/server/src/config/relevance.js)):

| Match Count | Relevance Verdict | Meaning for Tritorc |
| :---: | :---: | :--- |
| **0 Matches** | `Not Related` | No bolting or flange management scope found. Skip bid. |
| **1 – 2 Matches** | `Possibly Related` | Borderline mention; manual engineering review advised. |
| **3+ Matches** | `Related` | High bolting/flange intent; strong candidate for bidding. |

To change thresholds, edit `server/src/config/relevance.js`—no code changes are required.

---

## Excel Report Generation

- **Format**: `.xlsx` generated using `exceljs` in-memory.
- **Columns**:
  1. `Document Name` (width: 32)
  2. `Matched Keywords` (width: 44, comma-separated or `(none found)`)
  3. `Match Count` (width: 14, centered)
  4. `Relevance to Tritorc` (width: 22, centered with conditional color fill)
- **Formatting**:
  - Header: Tritorc Navy Blue (`#1F4E79`) with bold white text.
  - Relevance Fill: Soft green (`#C6EFCE`) for *Related*, soft yellow (`#FFEB9C`) for *Possibly Related*, soft red (`#FFC7CE`) for *Not Related*.
  - Frozen Top Row: Headers stay visible while scrolling.
- **Download Flow**: Sent as a Base64 string in the scan JSON response and automatically converted into a downloadable blob in the browser when clicking **Download Excel Report (.xlsx)**.

---

## Supported File Types & Limits

- **Formats**: `.pdf` (Portable Document Format) and `.docx` (Microsoft Word OpenXML).
- **Max File Size**: 15 MB per file.
- **Max Batch Count**: 10 files per upload.
- **Unsupported Formats**: If an unsupported file (e.g. `.txt` or `.xlsx`) is included in a batch, it is flagged with a clear error message while valid files continue processing uninterrupted.

---

## Known Limitations

1. **Scanned / Image-Only PDFs**: Text extraction via `pdf-parse` reads textual streams. If a PDF is a scanned photocopy or flattened raster image without an OCR layer, text cannot be extracted without an OCR preprocessing step.
2. **Password-Protected Documents**: Encrypted PDFs or password-locked DOCX files will trigger a processing error.
3. **Large Files (>15MB)**: Files exceeding 15MB are rejected by Multer limits to protect server memory.

---

## Example User Workflow

1. **Open the App**: Navigate to `http://localhost:5173`.
2. **Inspect Configured Keywords**: Expand the *"Configured Scanning Keywords"* panel to view the 20 active Tritorc terms.
3. **Stage Documents**: Drag and drop 1 or more PDF/DOCX files into the dropzone (or click to browse).
4. **Review Selection**: Verify file names and sizes in the preview list; remove any unwanted files using the `X` button.
5. **Click Scan**: Press the primary `"Scan X Documents for Keywords"` button.
6. **Review Results**: Observe summary statistics cards and the detailed breakdown per document with matched keyword tags and color-coded relevance badges.
7. **Filter & Search**: Use the search input or category pills (`All`, `Related`, `Possibly`, `Not Related`) to inspect specific files.
8. **Export**: Click `"Download Excel Report (.xlsx)"` to save the official spreadsheet report.
9. **Start New Scan**: Click `"Start New Scan"` to reset the interface and evaluate the next batch.
