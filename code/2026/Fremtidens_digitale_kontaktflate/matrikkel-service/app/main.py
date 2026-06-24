# Standard library
import logging
import os
import time

# Third-party
from fastapi import FastAPI, Request

logging.basicConfig(level=logging.INFO, format="%(message)s")
demo = logging.getLogger("demo")

# Internal - Routes
from app.routes.eiendom import router as eiendom_router
from app.routes.eiere import router as eiere_router
from app.routes.bygg import router as bygg_router
from app.routes.naboer import router as naboer_router
from app.routes.avgifter import router as avgifter_router
from app.routes.fiks_matrikkel_eier import router as fiks_matrikkel_eier_router

app = FastAPI()

app.include_router(eiendom_router)
app.include_router(eiere_router)
app.include_router(bygg_router)
app.include_router(naboer_router)
app.include_router(avgifter_router)
app.include_router(fiks_matrikkel_eier_router)


async def demo_logging(request: Request, call_next):
    if request.url.path in ("/", "/health"):
        return await call_next(request)
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    demo.info("\U0001f7e9 MATRIKKEL \u2190 %s %s \u2192 %d (%.0fms)", request.method, request.url.path, response.status_code, ms)
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
