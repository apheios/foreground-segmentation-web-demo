from functools import lru_cache
import json
from os import getenv
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

BACKEND_DIR = Path(__file__).resolve().parents[2]
CONFIG_DIR = BACKEND_DIR / "config"
QWEN_CONFIG_PATH = CONFIG_DIR / "qwen.local.json"
CAMODIFFUSION_CONFIG_FILE_PATH = CONFIG_DIR / "camodiffusion.local.json"


def _parse_cors_origins(raw_value: str) -> list[str]:
    return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


def _load_json_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}

    with path.open("r", encoding="utf-8") as config_file:
        data = json.load(config_file)

    if not isinstance(data, dict):
        raise ValueError(f"{path} must contain a JSON object")

    return data


def _get_config_value(config: dict[str, Any], key: str, env_name: str, default: Any = None) -> Any:
    env_value = getenv(env_name)
    if env_value not in (None, ""):
        return env_value
    value = config.get(key)
    return default if value in (None, "") else value


class Settings(BaseModel):
    app_name: str = "Foreground Segmentation Demo Backend"
    app_version: str = "0.1.0"
    service_name: str = "foreground-segmentation-demo-backend"
    api_prefix: str = "/api"
    qwen_api_key: str | None = None
    qwen_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    qwen_evaluation_model: str = "qwen3-vl-plus"
    qwen_request_timeout_seconds: float = 60.0
    camodiffusion_reference_dir: str | None = None
    camodiffusion_config_path: str | None = None
    camodiffusion_checkpoint_path: str | None = None
    camodiffusion_device: str = "auto"
    camodiffusion_num_sample_steps: int | None = None
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8081",
            "http://127.0.0.1:8081",
        ]
    )


@lru_cache
def get_settings() -> Settings:
    qwen_config = _load_json_config(QWEN_CONFIG_PATH)
    camodiffusion_config = _load_json_config(CAMODIFFUSION_CONFIG_FILE_PATH)

    return Settings(
        app_name=getenv("APP_NAME", "Foreground Segmentation Demo Backend"),
        app_version=getenv("APP_VERSION", "0.1.0"),
        service_name=getenv("SERVICE_NAME", "foreground-segmentation-demo-backend"),
        api_prefix=getenv("API_PREFIX", "/api"),
        qwen_api_key=_get_config_value(qwen_config, "qwen_api_key", "DASHSCOPE_API_KEY"),
        qwen_base_url=_get_config_value(
            qwen_config,
            "qwen_base_url",
            "DASHSCOPE_BASE_URL",
            "https://dashscope.aliyuncs.com/compatible-mode/v1",
        ),
        qwen_evaluation_model=_get_config_value(
            qwen_config,
            "qwen_evaluation_model",
            "QWEN_EVALUATION_MODEL",
            "qwen3-vl-plus",
        ),
        qwen_request_timeout_seconds=float(
            _get_config_value(
                qwen_config,
                "qwen_request_timeout_seconds",
                "QWEN_REQUEST_TIMEOUT_SECONDS",
                60,
            )
        ),
        camodiffusion_reference_dir=_get_config_value(
            camodiffusion_config,
            "camodiffusion_reference_dir",
            "CAMODIFFUSION_REFERENCE_DIR",
        ),
        camodiffusion_config_path=_get_config_value(
            camodiffusion_config,
            "camodiffusion_config_path",
            "CAMODIFFUSION_CONFIG_PATH",
        ),
        camodiffusion_checkpoint_path=_get_config_value(
            camodiffusion_config,
            "camodiffusion_checkpoint_path",
            "CAMODIFFUSION_CHECKPOINT_PATH",
        ),
        camodiffusion_device=_get_config_value(
            camodiffusion_config,
            "camodiffusion_device",
            "CAMODIFFUSION_DEVICE",
            "auto",
        ),
        camodiffusion_num_sample_steps=(
            int(_get_config_value(camodiffusion_config, "camodiffusion_num_sample_steps", "CAMODIFFUSION_NUM_SAMPLE_STEPS"))
            if getenv("CAMODIFFUSION_NUM_SAMPLE_STEPS")
            or camodiffusion_config.get("camodiffusion_num_sample_steps") not in (None, "")
            else None
        ),
        cors_origins=_parse_cors_origins(
            getenv(
                "CORS_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,http://127.0.0.1:8081",
            )
        ),
    )
