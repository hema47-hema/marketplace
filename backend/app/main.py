from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Register routes
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(proposals.router)
app.include_router(ai.router)
app.include_router(milestones.router)
app.include_router(messages.router)
app.include_router(reviews.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "NexusAI Freelance Marketplace Backend",
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
