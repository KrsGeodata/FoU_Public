from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers.plans import router as plans_router
from routers.bestemmelser import router as bestemmelse_router
from routers.auth import router as auth_router
from routers.galleri import router as galleri_router
from database.migrations import run_migrations

# Run database migrations on startup
print("🔄 Running database migrations...")
if run_migrations():
    print("✅ Migrations completed successfully")
else:
    print("❌ Migrations failed! Exiting.")
    exit(1)

app = FastAPI(
    title="Mikro-drømmeplan API",
    description="Backend for administrasjon av reguleringsplaner og drømmeplaner",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://geokrs.no",
        "http://geokrs.no",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (gallery images)
import os
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/public", StaticFiles(directory=static_dir), name="static")

app.include_router(plans_router)
app.include_router(bestemmelse_router)
app.include_router(auth_router)
app.include_router(galleri_router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Mikro-drømmeplan API is running"}



