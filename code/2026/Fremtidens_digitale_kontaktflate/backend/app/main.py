import logging
import os
import time

import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

logging.basicConfig(level=logging.INFO, format="%(message)s")
demo = logging.getLogger("demo")

# Internal - Routes
from app.routes.property_info import router as property_info_router
from app.routes.map import router as map_router
from app.routes.neighbor_list import router as neighbor_list_router
from app.clients.matrikkel_client import MatrikkelClient
from app.clients.cms_client import CmsClient
from app.clients.renovasjon_client import RenovasjonClient
from app.clients.fiks_innsyn_client import FiksInnsynClient
from app.clients.fiks_matrikkel_client import FiksMatrikkelClient
from app.routes import building_details
from app.routes import byggesak
from app.routes import avgifter
from app.routes.auth import router as auth_router
from app.routes import municipality_config
from app.routes import cms
from app.routes import renovasjon
from app.routes import eiendommer

# App
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient()
    app.state.matrikkel_client = MatrikkelClient(app.state.http_client)
    app.state.cms_client = CmsClient(app.state.http_client)
    app.state.renovasjon_client = RenovasjonClient(app.state.http_client)
    app.state.fiks_innsyn_client = FiksInnsynClient(app.state.http_client)
    app.state.fiks_matrikkel_client = FiksMatrikkelClient(app.state.http_client)
    yield
    await app.state.http_client.aclose()


app = FastAPI(lifespan=lifespan)

_static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=_static_dir), name="static")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5001,http://127.0.0.1:5001")
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(neighbor_list_router)
app.include_router(property_info_router)
app.include_router(map_router)
app.include_router(building_details.router)
app.include_router(byggesak.router)
app.include_router(avgifter.router)
app.include_router(municipality_config.router)
app.include_router(cms.router)
app.include_router(renovasjon.router)
app.include_router(eiendommer.router)


async def demo_logging(request: Request, call_next):
    if request.url.path in ("/", "/health"):
        return await call_next(request)
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    demo.info("\U0001f7e6 BACKEND   \u2190 %s %s \u2192 %d (%.0fms)", request.method, request.url.path, response.status_code, ms)
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
