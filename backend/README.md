# Backend

FastAPI backend for the foreground segmentation and training data evaluation demo platform.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## OpenAI Evaluation

The second demo page can call OpenAI Vision through the evaluation API.

Create or edit the local config file:

```bash
cp config/openai.example.json config/openai.local.json
```

Then set the API key and model in `config/openai.local.json`:

```json
{
  "openai_api_key": "your_api_key",
  "openai_evaluation_model": "gpt-4.1-mini",
  "openai_request_timeout_seconds": 60
}
```

`config/openai.local.json` is ignored by Git. If `openai_api_key` is empty, `/api/evaluation/evaluate` falls back to the local mock evaluator so the demo can still run offline.

## CamoDiffusion Segmentation

The first demo page can use the local reference repository at `../reference/CamoDiffusion` for single-image inference.

Create or edit the local config file:

```bash
cp config/camodiffusion.example.json config/camodiffusion.local.json
```

Then set the checkpoint path when a pretrained weight is available:

```json
{
  "camodiffusion_reference_dir": "../reference/CamoDiffusion",
  "camodiffusion_config_path": "../reference/CamoDiffusion/config/camoDiffusion_384x384.yaml",
  "camodiffusion_checkpoint_path": "/absolute/path/to/model-best.pt",
  "camodiffusion_device": "auto",
  "camodiffusion_num_sample_steps": 10
}
```

`config/camodiffusion.local.json` is ignored by Git. If `camodiffusion_checkpoint_path` is empty or the file is missing, `/api/segmentation/infer` falls back to the local mock result.

Single-image script:

```bash
python scripts/camodiffusion_single_infer.py \
  --image /path/to/input.jpg \
  --checkpoint /path/to/model-best.pt \
  --output /path/to/mask.png
```

CamoDiffusion has heavy optional dependencies such as PyTorch, torchvision, timm, omegaconf, einops, and accelerate. Install the reference repository requirements in a compatible Python/CUDA environment before enabling the checkpoint-backed path.

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
- Mock foreground segmentation
- Optional CamoDiffusion-backed foreground segmentation with mock fallback
- OpenAI-backed training data evaluation with mock fallback
