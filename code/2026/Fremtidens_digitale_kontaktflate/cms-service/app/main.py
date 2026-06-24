"""cms-service — proxy between the backend and Wagtail CMS.

All CMS data flows through this service. The backend never talks to Wagtail
directly. This gives us a single place to rewrite URLs, shape responses,
and swap the CMS engine without touching the backend.

Architecture:
    Backend  ->  cms-service (this)  ->  Wagtail CMS
"""

import logging
import os
import time
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request

logging.basicConfig(level=logging.INFO, format="%(message)s")
demo = logging.getLogger("demo")

from app.routes.municipality_config import router as municipality_config_router
from app.routes.tooltips import router as tooltips_router
from app.routes.page_content import router as page_content_router
from app.routes.media import router as media_router
from app.clients.wagtail_client import WagtailClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient()
    app.state.wagtail_client = WagtailClient(app.state.http_client)
    yield
    await app.state.http_client.aclose()


app = FastAPI(lifespan=lifespan)

app.include_router(municipality_config_router)
app.include_router(tooltips_router)
app.include_router(page_content_router)
app.include_router(media_router)


async def demo_logging(request: Request, call_next):
    if request.url.path in ("/", "/health"):
        return await call_next(request)
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    demo.info("\U0001f7e7 CMS       \u2190 %s %s \u2192 %d (%.0fms)", request.method, request.url.path, response.status_code, ms)
    return response


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


# Demo logging middleware is opt-in via DEMO_MODE env flag (see issue #547).
if os.getenv("DEMO_MODE", "false").lower() == "true":
    app.middleware("http")(demo_logging)
