from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent
REFERENCE_DIR = PROJECT_ROOT / "reference"
CAMODIFFUSION_DIR = REFERENCE_DIR / "CamoDiffusion"
STATIC_DIR = APP_DIR / "static"
SAMPLES_DIR = STATIC_DIR / "samples"
OUTPUTS_DIR = STATIC_DIR / "outputs"
UPLOADS_DIR = OUTPUTS_DIR / "uploads"
DATA_DIR = APP_DIR / "data"
SAMPLES_JSON = DATA_DIR / "samples.json"


def ensure_runtime_dirs() -> None:
    for path in (STATIC_DIR, SAMPLES_DIR, OUTPUTS_DIR, UPLOADS_DIR, DATA_DIR):
        path.mkdir(parents=True, exist_ok=True)
