# Standard library
import logging
import os
import time
from contextlib import asynccontextmanager

# Third-party
from fastapi import FastAPI, Request

# Local
from app.seed import seed_database
from app.routes.innsyn import router as innsyn_router

logging.basicConfig(level=logging.INFO, format="%(message)s")
demo = logging.getLogger("demo")


@asynccontextmanager
async def lifespan(application: FastAPI):
    seed_database()
    yield


app = FastAPI(
    title="Arkiv Service",
    description="FIKS Innsyn mock service",
    lifespan=lifespan,
)


app.include_router(innsyn_router)


async def demo_logging(request: Request, call_next):
    if request.url.path in ("/", "/health"):
        return await call_next(request)
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    demo.info("\U0001f7ea ARKIV     \u2190 %s %s \u2192 %d (%.0fms)", request.method, request.url.path, response.status_code, ms)
    return response


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


# Demo logging middleware is opt-in via DEMO_MODE env flag (see issue #547).
if os.getenv("DEMO_MODE", "false").lower() == "true":
    app.middleware("http")(demo_logging)
