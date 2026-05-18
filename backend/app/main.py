from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.evaluation import router as evaluation_router
from app.api.health import router as health_router
from app.api.samples import router as samples_router
from app.api.segmentation import router as segmentation_router
from app.core.config import get_settings
from app.core.paths import STATIC_DIR, ensure_runtime_dirs


def create_app() -> FastAPI:
    settings = get_settings()
    ensure_runtime_dirs()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Mock backend skeleton for foreground segmentation and training data evaluation demos.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    app.include_router(health_router, prefix=settings.api_prefix)
    app.include_router(segmentation_router, prefix=settings.api_prefix)
    app.include_router(evaluation_router, prefix=settings.api_prefix)
    app.include_router(samples_router, prefix=settings.api_prefix)

    return app


app = create_app()
