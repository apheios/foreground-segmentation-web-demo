# Display System Demo Platform

This repository contains a frontend and a mock FastAPI backend for demonstrating two research results:

- Foreground segmentation model demo
- Training data evaluation demo

The project is organized as a frontend-backend separated application.

## Directory Structure

```text
.
├── backend/              # FastAPI mock backend
│   ├── app/
│   ├── requirements.txt
│   └── README.md
├── frontend/             # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/api/health
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server:

```text
http://localhost:8081/
```

The Vite dev server proxies `/api` and `/static` to:

```text
http://127.0.0.1:8000
```

## Local Integration

Start the backend first, then start the frontend.

```bash
# terminal 1
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# terminal 2
cd frontend
npm run dev
```

Current mock backend endpoints:

```text
GET  /api/health
POST /api/segmentation/infer
POST /api/evaluation/evaluate
GET  /static/...
```

The backend does not use a database, Celery, Redis, WebSocket, or real model adapters at this stage.
