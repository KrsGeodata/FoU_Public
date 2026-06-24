import logging
import os
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(message)s")
demo = logging.getLogger("demo")

from app.config import CORS_ORIGINS
from app.routes.renovasjon import router as renovasjon_router

app = FastAPI(title="RenovasjonAPI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(renovasjon_router)


async def demo_logging(request: Request, call_next):
    if request.url.path in ("/", "/health"):
        return await call_next(request)
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    demo.info("\U0001f7e5 RENOVASJON \u2190 %s %s \u2192 %d (%.0fms)", request.method, request.url.path, response.status_code, ms)
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
