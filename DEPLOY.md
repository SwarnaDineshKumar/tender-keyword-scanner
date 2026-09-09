# Deployment Architecture & Production Guide

> [!NOTE]
> Actual cloud deployment is not required for this take-home assignment. The application has been developed and verified for local execution. This document describes the deployment approach that would be used for a production deployment.

---

## 1. Recommended Deployment Architecture

The application can be deployed as separate frontend and backend services, with MongoDB Atlas providing persistent scan history.

    [Browser]
        |
        | HTTPS
        v
    [React + Vite Frontend]
        |
        | REST API
        v
    [Node.js + Express Backend]
        |
        +--> PDF/DOCX Text Extraction
        |
        +--> Deterministic Keyword Matching
        |
        +--> Relevance Scoring
        |
        +--> Excel Report Generation
        |
        v
    [MongoDB Atlas]
        |
        +--> Scan History

### Frontend

Recommended hosting options:

- Vercel
- Netlify

The frontend is a Vite/React application located in:

    client/

Build command:

    npm run build

The generated production files are placed in:

    client/dist/

### Backend

Recommended hosting options:

- Render
- Railway
- Fly.io

The Express API is located in:

    server/

Production start command:

    node src/index.js

The backend requires access to MongoDB Atlas because scan history is part of the implemented application.

---

## 2. Environment Variables

### Backend

The backend uses:

    server/.env

Required variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port used by the Express API | `4000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@<cluster>/tender_scanner` |

Example:

    PORT=4000
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/tender_scanner

The actual MongoDB connection string must never be committed to GitHub.

### Frontend

The frontend communicates with the backend API.

For local development, API requests are handled through the Vite development proxy.

For production deployment, the frontend API configuration can be updated to point to the deployed backend URL.

---

## 3. MongoDB Atlas

MongoDB Atlas is used to persist scan history.

### Database

    tender_scanner

### Collection

    scan_history

Each successful document scan stores information including:

- Batch ID
- Document name
- Matched keywords
- Match count
- Relevance
- Scan timestamp

### Production Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Configure Network Access for the backend host.
4. Obtain the MongoDB connection string.
5. Add the connection string as `MONGODB_URI` in the backend deployment environment.
6. Deploy or restart the backend.

The application does not store uploaded tender files permanently in MongoDB. MongoDB is used for scan-history persistence.

---

## 4. Frontend to Backend Configuration

### Local Development

The frontend uses the Vite development environment and communicates with the local Express API.

Backend:

    http://localhost:4000

Frontend:

    http://localhost:5173

The frontend uses `/api` routes for backend communication.

### Production

After deployment, the frontend should communicate with the public HTTPS URL of the backend.

For example:

    https://<backend-service>.onrender.com

The frontend API configuration can be updated to use the production backend URL.

The exact production URL will depend on the selected hosting provider and deployment configuration.

---

## 5. CORS

Because the frontend and backend may be hosted on separate domains, the backend should restrict CORS to the deployed frontend origin in production.

For local development, the application currently allows the frontend to communicate with the local API.

For production, the CORS configuration should be changed to allow only the deployed frontend domain.

Example production relationship:

    Frontend:
    https://<frontend-domain>

    Backend:
    https://<backend-domain>

The production frontend URL should be added to the backend's allowed CORS origins.

---

## 6. Build and Start Commands

### Backend

Install dependencies:

    cd server
    npm install

Start production server:

    node src/index.js

Run tests:

    npm test

### Frontend

Install dependencies:

    cd client
    npm install

Create production build:

    npm run build

The production build is generated in:

    client/dist/

---

## 7. File Processing Considerations

The backend currently processes uploaded files in memory.

Current limits are:

- Maximum file size: 15 MB per file
- Maximum number of files per request: 10
- Supported formats: PDF and DOCX

This approach is suitable for the current take-home application.

For a high-volume production system, additional measures could be introduced, such as:

- Background job processing
- Object storage for uploaded documents
- Queue-based processing
- Request timeouts
- Resource monitoring
- Additional memory/CPU allocation

---

## 8. Production API

The backend exposes the following REST endpoints:

    GET /api/health

    GET /api/keywords

    POST /api/scan

    GET /api/history

The production API URL will depend on the selected hosting provider.

Example:

    https://<backend-domain>/api/health

---

## 9. Deployment Flow

A typical production deployment would follow this sequence:

1. Push the project to GitHub.
2. Create a MongoDB Atlas cluster.
3. Deploy the Express backend to Render, Railway, or another Node.js hosting provider.
4. Configure `MONGODB_URI` in the backend environment.
5. Configure the backend CORS settings for the frontend domain.
6. Deploy the React/Vite frontend to Vercel or Netlify.
7. Configure the frontend to use the deployed backend API URL.
8. Verify the health endpoint.
9. Upload sample PDF/DOCX documents.
10. Verify keyword matching and relevance results.
11. Verify Excel report generation.
12. Verify that scan history is persisted and retrieved from MongoDB.

---

## 10. Security Considerations

Before production deployment:

- Keep MongoDB credentials in environment variables.
- Do not commit `.env` files.
- Use HTTPS for frontend and backend communication.
- Restrict MongoDB Atlas Network Access where practical.
- Restrict production CORS to the frontend domain.
- Maintain reasonable upload-size limits.
- Validate uploaded file types.
- Monitor server resources for large document uploads.

---

## 11. Current Deployment Status

Cloud deployment is not required for this assignment.

The application has been developed as a locally runnable full-stack application with:

- React/Vite frontend
- Node.js/Express REST API
- PDF and DOCX text extraction
- Deterministic keyword matching
- Relevance scoring
- Excel report generation
- MongoDB Atlas scan history

Production deployment can be added using the architecture described above without changing the core scanning workflow.

---

## 12. Future Production Improvements

If the application were expanded for larger production workloads, possible improvements include:

- OCR for image-only/scanned PDFs
- Background document processing
- Object storage for large uploads
- Authentication and authorization
- User-specific scan history
- Pagination and filtering for history
- Rate limiting
- Structured application logging
- Monitoring and health checks
- Redis caching where appropriate
- Automated CI/CD deployment

---

## Repository

GitHub:

https://github.com/SwarnaDineshKumar/tender-keyword-scanner