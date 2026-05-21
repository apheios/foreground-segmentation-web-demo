# Display System Demo Platform

This repository contains a frontend and a FastAPI backend for demonstrating two research results:

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

## OpenAI Evaluation

The second page uses `POST /api/evaluation/evaluate`. When `OPENAI_API_KEY` is configured, the backend sends the uploaded image-mask pair to an OpenAI vision model and returns:

- `iqa_score`
- `task_representativeness`
- `train_suitability`
- structured `explanation`
- `answer` JSON

Configure OpenAI in `backend/config/openai.local.json`:

```bash
cd backend
cp config/openai.example.json config/openai.local.json
```

```json
{
  "openai_api_key": "your_api_key",
  "openai_evaluation_model": "gpt-4.1-mini",
  "openai_request_timeout_seconds": 60
}
```

```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

`backend/config/openai.local.json` is ignored by Git. Without a configured API key, the evaluation endpoint keeps using a local mock fallback.

## CamoDiffusion Segmentation

The first page uses `POST /api/segmentation/infer`. The backend is wired to use the local reference repository:

```text
reference/CamoDiffusion
```

Configure the checkpoint in `backend/config/camodiffusion.local.json`:

```bash
cd backend
cp config/camodiffusion.example.json config/camodiffusion.local.json
```

```json
{
  "camodiffusion_reference_dir": "../reference/CamoDiffusion",
  "camodiffusion_config_path": "../reference/CamoDiffusion/config/camoDiffusion_384x384.yaml",
  "camodiffusion_checkpoint_path": "/absolute/path/to/model-best.pt",
  "camodiffusion_device": "auto",
  "camodiffusion_num_sample_steps": 10
}
```

Current repository state intentionally leaves `camodiffusion_checkpoint_path` empty. Without a checkpoint, the segmentation endpoint keeps returning the mock result.

Single-image script:

```bash
cd backend
python scripts/camodiffusion_single_infer.py \
  --image /path/to/input.jpg \
  --checkpoint /path/to/model-best.pt \
  --output /path/to/mask.png
```

The backend does not use a database, Celery, Redis, or WebSocket.
