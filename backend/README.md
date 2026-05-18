# Backend

Mock FastAPI backend skeleton for the foreground segmentation and training data evaluation demo platform.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{
  "success": true,
  "status": "ok",
  "service": "foreground-segmentation-demo-backend"
}
```

Static files are served from:

```text
http://localhost:8000/static
```

## Current Scope

- FastAPI application initialization
- CORS configuration for local frontend development
- `/api/health`
- `/static` mount
- Basic config, paths, and Pydantic schemas
- Placeholder service and adapter modules for future model integration
