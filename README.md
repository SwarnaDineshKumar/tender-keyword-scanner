# Tender / Scope-of-Work Keyword Scanner

An automated full-stack web application designed for **Tritorc's** sales and engineering bid estimation team.

The application ingests tender documents and Scope of Work (SOW) files in **PDF and DOCX** format, screens them against a configurable catalog of Tritorc-relevant bolting and flange-management keywords, calculates document relevance, stores successful scan history in **MongoDB Atlas**, and generates styled downloadable **Excel reports**.

---

## What the Application Does

Tritorc regularly receives large tender packages and complex SOW documents from EPC contractors, refinery operators, and asset owners. Manually reviewing these documents to identify mechanical bolting, flange management, torque-tool, or shutdown-related requirements can be time-consuming.

This application automates the initial document-screening stage of the bid qualification process.

### Workflow

1. Users upload one or more tender/SOW documents.
2. The backend validates the uploaded files and accepts `.pdf` and `.docx` documents.
3. PDF text is extracted using `pdf-parse`.
4. DOCX text is extracted using `mammoth`.
5. The extracted text is scanned against the configured Tritorc keyword catalog.
6. Matching is performed using deterministic, rules-based logic.
7. Distinct matched keywords are counted.
8. A relevance verdict is calculated dynamically from the number of matched keywords.
9. Successful scan results are stored in MongoDB Atlas.
10. The frontend displays the current scan results and previous scan history.
11. Users can download the scan results as a formatted Excel workbook.

---

## Key Features

### Multi-Document Upload

- Upload multiple PDF and DOCX documents in a single scan.
- Drag-and-drop or file-selection interface.
- Files are processed independently.
- A failure in one document does not prevent other valid documents from being scanned.

### Deterministic Keyword Matching

The scanner uses a **rules-based matching engine** rather than an AI/LLM to determine relevance.

Matching supports:

- Case-insensitive matching
- Singular/plural variants
- Common engineering verb variants
- Hyphen and spacing tolerance
- Word-boundary protection
- Subword false-positive prevention

Common engineering variants such as `tensioning` / `tensioned`, `tightening` / `tightened`, and `bolting` / `bolted` are handled where applicable.

### Distinct Keyword Counting

Repeated mentions of the same keyword do not artificially increase the relevance score.

Each configured keyword contributes at most one distinct match per document.

### Dynamic Relevance Scoring

Relevance is calculated from the number of distinct matched keywords.

The current scoring model is:

| Match Count | Relevance |
|---:|---|
| 0 | Not Related |
| 1–2 | Possibly Related |
| 3+ | Related |

The thresholds are configurable in the backend.

### MongoDB Scan History

Successful scan results are persisted in **MongoDB Atlas**.

Each history record stores:

- Batch ID
- Document name
- Matched keywords
- Match count
- Relevance verdict
- Scan timestamp

The application displays recent scan history with the newest scans shown first.

### Excel Export

The backend generates a formatted `.xlsx` report using `ExcelJS`.

The report includes:

- Document Name
- Matched Keywords
- Match Count
- Relevance

### Responsive Frontend

The frontend provides a clean, professional interface for:

- Uploading documents
- Viewing configured keywords
- Reviewing scan results
- Viewing scan statistics
- Downloading Excel reports
- Reviewing previous scan history

---

## Tritorc Keyword Catalog

The default keyword catalog contains 20 Tritorc-relevant terms:

1. Hydraulic torque wrench
2. Bolt tensioner
3. Hydraulic bolt tensioning
4. Controlled bolting
5. Flange management
6. Flange joint integrity
7. Torque wrench
8. Stud bolt tensioning
9. Nut splitter
10. Torque multiplier
11. Bolting tools
12. Flange bolt tightening
13. Turnaround services
14. Shutdown maintenance
15. Plant shutdown
16. Bolted joint
17. Pre-tensioning
18. Gasket and flange management
19. Torque calibration
20. Mechanical bolting

The keywords are maintained in:

    server/src/config/keywords.json

This allows the keyword catalog to be modified without changing the core matching logic.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Client-side application and UI |
| **Icons & Styling** | Lucide React, Custom CSS | Interface icons and responsive styling |
| **Backend** | Node.js, Express | REST API and application logic |
| **Database** | MongoDB Atlas | Persistent scan history |
| **File Uploads** | Multer | In-memory multipart file handling |
| **PDF Extraction** | `pdf-parse` | PDF text extraction |
| **DOCX Extraction** | `mammoth` | DOCX text extraction |
| **Excel Generation** | `exceljs` | Styled Excel report generation |
| **Testing** | Node.js `node:test` | Backend automated testing |

---

## Project Structure

    tender-keyword-scanner/
    │
    ├── client/
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── FileUpload.jsx
    │   │   │   ├── ResultsTable.jsx
    │   │   │   ├── RelevanceBadge.jsx
    │   │   │   ├── KeywordList.jsx
    │   │   │   └── Header.jsx
    │   │   │
    │   │   ├── services/
    │   │   │   └── api.js
    │   │   │
    │   │   ├── App.jsx
    │   │   ├── App.css
    │   │   ├── index.css
    │   │   └── main.jsx
    │   │
    │   ├── index.html
    │   ├── vite.config.js
    │   └── package.json
    │
    ├── server/
    │   ├── src/
    │   │   ├── config/
    │   │   │   ├── env.js
    │   │   │   ├── mongodb.js
    │   │   │   ├── keywords.json
    │   │   │   └── relevance.js
    │   │   │
    │   │   ├── controllers/
    │   │   │   └── scan.controller.js
    │   │   │
    │   │   ├── middleware/
    │   │   │   └── upload.js
    │   │   │
    │   │   ├── routes/
    │   │   │   └── scan.routes.js
    │   │   │
    │   │   ├── services/
    │   │   │   ├── extractText.service.js
    │   │   │   ├── matchKeywords.service.js
    │   │   │   ├── scoreRelevance.service.js
    │   │   │   ├── excel.service.js
    │   │   │   ├── extractFields.service.js
    │   │   │   └── scanHistory.service.js
    │   │   │
    │   │   ├── utils/
    │   │   │   └── keywords.js
    │   │   │
    │   │   └── index.js
    │   │
    │   ├── test/
    │   │   ├── apiScan.test.js
    │   │   ├── keywordMatching.test.js
    │   │   ├── extraction.test.js
    │   │   ├── relevance.test.js
    │   │   └── excel.test.js
    │   │
    │   ├── .env.example
    │   └── package.json
    │
    ├── sample-documents/
    │
    ├── package.json
    ├── AI_NOTES.txt
    ├── DEPLOY.md
    └── README.md

---

## Prerequisites

Make sure the following are installed:

- Node.js 18+
- npm
- MongoDB Atlas account/database for scan history

Node.js can be downloaded from:

https://nodejs.org/

---

## Installation

Clone the repository:

    git clone https://github.com/SwarnaDineshKumar/tender-keyword-scanner.git

Move into the project:

    cd tender-keyword-scanner

Install the root dependencies:

    npm install

Install backend dependencies:

    cd server
    npm install

Install frontend dependencies:

    cd ../client
    npm install

Return to the project root:

    cd ..

---

## Environment Variables

The backend uses environment variables for configuration.

Create:

    server/.env

Example:

    PORT=4000
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/tender_scanner

### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Allow the required application IP address in Atlas Network Access.
4. Copy the MongoDB connection string.
5. Add it to `server/.env` as `MONGODB_URI`.

The application uses the database:

    tender_scanner

and stores scan history in:

    scan_history

Do **not** commit `server/.env` or MongoDB credentials to GitHub.

---

## Running the Application

The backend and frontend run as separate development processes.

### Start Backend

From the project root:

    cd server
    npm run dev

The API will be available at:

    http://localhost:4000

### Start Frontend

Open another terminal:

    cd client
    npm run dev

Vite will provide the frontend development URL, normally:

    http://localhost:5173

The Vite development server proxies `/api` requests to the Express backend.

---

## API Endpoints

### Health Check

    GET /api/health

Returns the current API health status.

### Get Keywords

    GET /api/keywords

Returns the currently configured Tritorc keyword catalog.

### Scan Documents

    POST /api/scan

Content type:

    multipart/form-data

Files must be sent using the field name:

    files

The endpoint returns the scan results and a generated Excel report encoded for frontend download.

### Get Scan History

    GET /api/history

Returns recent successful scan records stored in MongoDB Atlas.

The history endpoint returns the newest scan records first.

---

## How Keyword Matching Works

The scanner intentionally uses deterministic matching rather than an AI model.

The processing pipeline is:

    Uploaded Document
           ↓
    File Validation
           ↓
    Text Extraction
           ↓
    Text Normalization
           ↓
    Keyword Pattern Matching
           ↓
    Distinct Keyword Matches
           ↓
    Match Count
           ↓
    Relevance Score
           ↓
    MongoDB History
           ↓
    Frontend + Excel Report

### Why Deterministic Matching?

For a tender-screening tool, predictable results are important.

Given the same document and the same keyword configuration, the scanner should produce the same result every time.

This makes the relevance decision:

- Explainable
- Testable
- Reproducible
- Easy to modify

---

## Relevance Scoring

The relevance engine uses the number of distinct matched keywords.

Current thresholds:

| Match Count | Relevance |
|---:|---|
| 0 | Not Related |
| 1–2 | Possibly Related |
| 3+ | Related |

The scoring logic is separated from the keyword-matching service so the thresholds can be changed independently.

Configuration is maintained in:

    server/src/config/relevance.js

---

## MongoDB Scan History

MongoDB Atlas is used to persist successful scan results.

### Database

    tender_scanner

### Collection

    scan_history

Each successful document scan stores:

    batchId
    documentName
    matchedKeywords
    matchCount
    relevance
    scannedAt

Only successfully processed documents are saved to scan history.

If one uploaded file fails while other files are valid, the valid documents can still be scanned and persisted.

The frontend retrieves stored history through:

    GET /api/history

---

## Excel Report

After a successful scan, the backend generates an Excel workbook using `ExcelJS`.

The report contains:

| Column | Description |
|---|---|
| Document Name | Original uploaded document name |
| Matched Keywords | Distinct Tritorc keywords found |
| Match Count | Number of distinct matched keywords |
| Relevance | Calculated relevance verdict |

The generated workbook is returned by the API and downloaded directly through the frontend.

---

## File Handling & Limits

Uploaded files are processed in memory rather than permanently stored on the server.

The current backend configuration limits:

- Maximum file size: **15 MB per file**
- Maximum number of files per request: **10**
- Supported formats: **PDF and DOCX**

This keeps the application simple for the take-home evaluation while avoiding unnecessary temporary file management.

---

## Error Handling

The backend processes documents independently.

For example, if a batch contains:

    document-a.pdf
    document-b.docx
    document-c.txt

the unsupported `.txt` file can return an error while the valid PDF and DOCX files continue through the scanning pipeline.

The API handles cases such as:

- No uploaded files
- Unsupported file types
- File processing failures
- Internal server errors

An individual document failure does not prevent other valid documents in the same batch from being processed.

---

## Testing

The backend uses Node.js's built-in test runner:

    node:test

Run the backend test suite with:

    cd server
    npm test

The automated tests cover areas including:

- Keyword matching
- Keyword variants
- False-positive prevention
- Text extraction
- Relevance scoring
- Excel generation
- API scan behavior

---

## Sample Documents

The repository contains sample documents under:

    sample-documents/

The sample set represents different relevance levels, including:

- Not Related
- Possibly Related
- Related

These documents can be used to demonstrate the scanner during evaluation.

---

## Example User Workflow

### 1. Open the Application

Start the frontend and backend locally.

### 2. Review the Keyword Catalog

The interface displays the Tritorc keyword catalog used for screening.

### 3. Upload Tender Documents

Select one or more PDF/DOCX files or drag them into the upload area.

### 4. Start the Scan

The backend extracts the document text and runs the deterministic keyword engine.

### 5. Review Results

The application displays:

- Document name
- Matched keywords
- Match count
- Relevance

### 6. Review Scan History

Previous successful scans are retrieved from MongoDB Atlas and displayed in the application.

### 7. Export the Report

Download the generated Excel workbook for further bid-estimation or screening work.

---

## AI Usage

AI was used as a **development assistant**, not as the application's decision-making engine.

The scanner itself does not use an AI/LLM to determine:

- Keyword matches
- Match counts
- Relevance
- Excel results

The actual application logic is implemented using deterministic backend services.

This approach was intentionally chosen to make results reproducible and explainable.

Details of AI assistance, prompts, and modifications made to AI-generated suggestions are documented in:

    AI_NOTES.txt

---

## Deployment Plan

The application is structured so that the frontend and backend can be deployed separately.

A possible deployment architecture is:

    User
      ↓
    React Frontend
      ↓
    Express REST API
      ↓
    MongoDB Atlas

The backend requires the following environment variables in the deployment environment:

    PORT=4000
    MONGODB_URI=<production-mongodb-connection-string>

Deployment considerations and environment configuration are documented separately in:

    DEPLOY.md

No production credentials are stored in the repository.

---

## Design & Engineering Decisions

### In-Memory File Processing

Multer memory storage is used because the scanner only needs the uploaded document during processing.

This avoids unnecessary permanent file storage.

### Separate Services

Text extraction, keyword matching, relevance scoring, Excel generation, and scan-history persistence are implemented as separate services.

This keeps the application modular and makes individual parts easier to test and modify.

### Deterministic Relevance

Relevance is calculated from explicit keyword matches rather than subjective AI-generated judgments.

This makes the result transparent to the user.

### MongoDB Atlas

MongoDB Atlas is used for scan-history persistence and provides a managed database suitable for a deployed version of the application.

---

## Limitations & Future Improvements

Possible future enhancements include:

- OCR support for scanned/image-only PDFs
- Fuzzy matching for more advanced terminology variations
- Configurable keyword management through the UI
- Search and filtering within scan history
- Pagination for large scan-history datasets
- Authentication and user-specific scan history
- Redis caching for high-volume deployments
- More advanced document field extraction
- Background processing for very large tender packages

---

## Repository

GitHub:

https://github.com/SwarnaDineshKumar/tender-keyword-scanner

---

## Supporting Documentation

| File | Purpose |
|---|---|
| `README.md` | Project overview and setup instructions |
| `AI_NOTES.txt` | AI assistance and prompt documentation |
| `DEPLOY.md` | Deployment and environment configuration plan |

---

## Project Objective

The goal of this project is to demonstrate a practical full-stack solution for automating the **initial screening of tender and Scope-of-Work documents** for Tritorc-relevant opportunities.

The implementation focuses on:

- Reliable document ingestion
- PDF/DOCX text extraction
- Deterministic keyword matching
- Explainable relevance scoring
- Excel reporting
- Persistent scan history
- Clean frontend presentation
- Modular backend architecture
- Automated testing