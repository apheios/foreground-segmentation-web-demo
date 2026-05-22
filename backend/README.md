# Backend

FastAPI backend for the foreground segmentation and training data evaluation demo platform.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Qwen Evaluation

The second demo page can call Qwen Vision through the evaluation API.

Create or edit the local config file:

```bash
cp config/qwen.example.json config/qwen.local.json
```

Then set the DashScope API key and model in `config/qwen.local.json`:

```json
{
  "qwen_api_key": "your_api_key",
  "qwen_base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "qwen_evaluation_model": "qwen3-vl-plus",
  "qwen_request_timeout_seconds": 60
}
```

`config/qwen.local.json` is ignored by Git. If `qwen_api_key` is empty, `/api/evaluation/evaluate` falls back to the local mock evaluator so the demo can still run offline.

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
  "camodiffusion_tasks": {
    "COD": {
      "config_path": "../reference/CamoDiffusion/config/camoDiffusion_384x384.yaml",
      "checkpoint_path": "/absolute/path/to/cod-model-best.pt"
    },
    "SOD": {
      "config_path": "../reference/CamoDiffusion/config/camoDiffusion-E_384x384.yaml",
      "checkpoint_path": "/absolute/path/to/sod-model-best.pt"
    }
  },
  "camodiffusion_device": "auto",
  "camodiffusion_num_sample_steps": 10
}
```

`config/camodiffusion.local.json` is ignored by Git. The `camodiffusion_config_path` and `camodiffusion_checkpoint_path` fields are defaults. A matching `camodiffusion_tasks.<task_type>` entry overrides config and checkpoint for that request. If the selected task has no checkpoint and the default checkpoint is empty or missing, `/api/segmentation/infer` falls back to the local mock result.

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
- Qwen-backed training data evaluation with mock fallback
