import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from .database import engine, Base, SessionLocal
from .models import *  # Load all models
from .seed_data import seed_database
from .routes import auth, projects, proposals, ai, milestones, messages, reviews, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="NexusAI Freelance Marketplace API",
    description="Full-stack AI-powered freelance marketplace with 6-digit email OTP verification, AI matching, escrow milestones, and real-time chat.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(proposals.router)
app.include_router(ai.router)
app.include_router(milestones.router)
app.include_router(messages.router)
app.include_router(reviews.router)
app.include_router(users.router)

@app.get("/api")
def api_info():
    return {
        "status": "online",
        "service": "NexusAI Freelance Marketplace API",
        "docs_url": "/docs",
        "features": [
            "6-digit Email OTP Verification",
            "AI Freelancer-Project Matchmaking Engine",
            "Milestone Escrow & Mock Payments",
            "Project Chat & Messaging",
            "Verified Post-Project Reviews"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Mount and serve the compiled React frontend directly
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str = ""):
        # Don't intercept API routes or Docs
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(static_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(static_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "online", "service": "NexusAI Backend"}
else:
    @app.get("/")
    def root_fallback():
        return {"status": "online", "service": "NexusAI Backend"}
