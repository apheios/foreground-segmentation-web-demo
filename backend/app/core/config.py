from functools import lru_cache
from os import getenv

from pydantic import BaseModel, Field


def _parse_cors_origins(raw_value: str) -> list[str]:
    return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


class Settings(BaseModel):
    app_name: str = "Foreground Segmentation Demo Backend"
    app_version: str = "0.1.0"
    service_name: str = "foreground-segmentation-demo-backend"
    api_prefix: str = "/api"
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
    return Settings(
        app_name=getenv("APP_NAME", "Foreground Segmentation Demo Backend"),
        app_version=getenv("APP_VERSION", "0.1.0"),
        service_name=getenv("SERVICE_NAME", "foreground-segmentation-demo-backend"),
        api_prefix=getenv("API_PREFIX", "/api"),
        cors_origins=_parse_cors_origins(
            getenv(
                "CORS_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,http://127.0.0.1:8081",
            )
        ),
    )
