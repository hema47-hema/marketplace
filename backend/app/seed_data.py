from sqlalchemy.orm import Session
from .models.user import User
from .models.project import Project
from .models.proposal import Proposal
from .models.milestone import Milestone
from .models.review import Review
from .models.message import Message
from .auth_utils import hash_password

def seed_database(db: Session):
    """Populates the database with realistic client, freelancer, project, and milestone demo data."""
    # Check if already seeded
    existing_user = db.query(User).filter(User.email == "client@demo.com").first()
    if existing_user:
        return

    hashed_pw = hash_password("password123")

    # 1. Create Demo Client
    client = User(
        email="client@demo.com",
        full_name="Sarah Chen",
        hashed_password=hashed_pw,
        role="client",
        is_verified=True,
        title="VP of Product & AI Initiatives @ ApexLabs",
        bio="Building high-growth AI and developer platform products. Always seeking stellar engineering talent.",
        skills="Product Management, System Architecture, Agile",
        balance=15000.0,
        escrow_balance=1200.0,
        rating=5.0,
        reviews_count=7,
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80"
    )
    db.add(client)
    db.commit()
    db.refresh(client)

    # 2. Create Top Freelancers
    f1 = User(
        email="alex@demo.com",
        full_name="Alex Rivera",
        hashed_password=hashed_pw,
        role="freelancer",
        is_verified=True,
        title="Principal AI & Full-Stack Engineer",
        bio="Ex-Stripe engineer specializing in scalable FastAPI backends, React TypeScript interfaces, and PyTorch ML models.",
        skills="React, FastAPI, Python, PostgreSQL, Machine Learning, TypeScript",
        hourly_rate=75.0,
        balance=3850.0,
        escrow_balance=0.0,
        rating=4.95,
        reviews_count=18,
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
    )

    f2 = User(
        email="maya@demo.com",
        full_name="Maya Patel",
        hashed_password=hashed_pw,
        role="freelancer",
        is_verified=True,
        title="Cloud Architect & DevOps Lead",
        bio="Kubernetes, Terraform, AWS, and zero-downtime microservice architecture. 8+ years building enterprise cloud infrastructure.",
        skills="Docker, Kubernetes, AWS, Python, CI/CD, Terraform",
        hourly_rate=85.0,
        balance=4200.0,
        escrow_balance=0.0,
        rating=5.0,
        reviews_count=12,
        avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80"
    )

    f3 = User(
        email="liam@demo.com",
        full_name="Liam Tanaka",
        hashed_password=hashed_pw,
        role="freelancer",
        is_verified=True,
        title="Senior UI/UX & Frontend Architect",
        bio="Obsessed with micro-interactions, accessibility, and high-performance React frontends. Figma master.",
        skills="React, TypeScript, Figma, Tailwind, UI/UX, Next.js",
        hourly_rate=65.0,
        balance=2100.0,
        escrow_balance=0.0,
        rating=4.85,
        reviews_count=15,
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
    )

    f4 = User(
        email="elena@demo.com",
        full_name="Elena Rostova",
        hashed_password=hashed_pw,
        role="freelancer",
        is_verified=True,
        title="Senior Backend & Data Systems Engineer",
        bio="High-throughput asynchronous APIs, PostgreSQL query tuning, Redis caching, and real-time streaming pipelines.",
        skills="FastAPI, Python, PostgreSQL, Redis, Docker, REST API",
        hourly_rate=70.0,
        balance=1950.0,
        escrow_balance=0.0,
        rating=4.9,
        reviews_count=11,
        avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80"
    )

    db.add_all([f1, f2, f3, f4])
    db.commit()
    db.refresh(f1)
    db.refresh(f2)
    db.refresh(f3)
    db.refresh(f4)

    # 3. Create Sample Projects
    p1 = Project(
        client_id=client.id,
        title="AI-Powered Document Extraction & Semantic Search API",
        description="We need an expert to build a FastAPI service that processes PDFs, generates vector embeddings with open-source ML models, and stores them in PostgreSQL with pgvector for lightning-fast semantic queries.",
        category="AI & Machine Learning",
        budget=2400.0,
        status="in_progress",
        required_skills="Python, FastAPI, Machine Learning, PostgreSQL",
        deadline_days=14,
        hired_freelancer_id=f1.id
    )

    p2 = Project(
        client_id=client.id,
        title="Next-Generation Collaborative Workspace Dashboard",
        description="Looking for an exceptional React + TypeScript engineer to construct an interactive canvas and real-time analytics dashboard with fluid animations and responsive mobile layouts.",
        category="Web Development",
        budget=1800.0,
        status="open",
        required_skills="React, TypeScript, Figma, UI/UX",
        deadline_days=10
    )

    p3 = Project(
        client_id=client.id,
        title="Automated Multi-Region Kubernetes & CI/CD Pipeline",
        description="Setup automated GitHub Actions workflows, Docker multi-stage builds, and production Kubernetes deployments with automated rollbacks and Datadog monitoring.",
        category="DevOps & Cloud",
        budget=1600.0,
        status="open",
        required_skills="Docker, Kubernetes, AWS, CI/CD",
        deadline_days=7
    )

    db.add_all([p1, p2, p3])
    db.commit()
    db.refresh(p1)
    db.refresh(p2)
    db.refresh(p3)

    # 4. Create Milestones for Project 1 (Active Contract)
    m1 = Milestone(
        project_id=p1.id,
        title="Milestone 1: Database Schema & Vector Ingestion Engine",
        description="PostgreSQL schema migration, PDF parsing worker, and embedding generation.",
        amount=1200.0,
        status="funded",  # Already funded into escrow by client
        due_days=5
    )
    m2 = Milestone(
        project_id=p1.id,
        title="Milestone 2: Semantic Query Endpoint & Benchmarks",
        description="FastAPI endpoint with cosine similarity search, caching layer, and integration tests.",
        amount=1200.0,
        status="pending",
        due_days=10
    )
    db.add_all([m1, m2])

    # 5. Create Proposals
    prop1 = Proposal(
        project_id=p1.id,
        freelancer_id=f1.id,
        cover_letter="I have built 4 similar semantic search engines using FastAPI and PostgreSQL vector extensions. I can deliver this cleanly within 12 days.",
        bid_amount=2400.0,
        estimated_days=12,
        status="accepted"
    )
    prop2 = Proposal(
        project_id=p2.id,
        freelancer_id=f3.id,
        cover_letter="My specialty is building highly responsive React canvas workspaces with beautiful design token systems. Check my portfolio!",
        bid_amount=1750.0,
        estimated_days=9,
        status="pending"
    )
    db.add_all([prop1, prop2])

    # 6. Create Reviews
    r1 = Review(
        project_id=p1.id,
        reviewer_id=client.id,
        reviewee_id=f1.id,
        rating=5.0,
        tags="Fast Delivery, Outstanding Architecture, Clean Code",
        comment="Alex is one of the sharpest engineers I've worked with. The FastAPI architecture was modular and lightning fast."
    )
    r2 = Review(
        project_id=p1.id,
        reviewer_id=f1.id,
        reviewee_id=client.id,
        rating=5.0,
        tags="Clear Requirements, Prompt Payment, Great Communication",
        comment="Sarah provided crystal-clear technical specifications and funded escrow immediately. A pleasure to collaborate with."
    )
    db.add_all([r1, r2])

    # 7. Create Messages
    msg1 = Message(
        project_id=p1.id,
        sender_id=client.id,
        receiver_id=f1.id,
        content="Hey Alex! Delighted to have you onboard for the Semantic Search project. The first milestone is funded in escrow.",
        is_read=True
    )
    msg2 = Message(
        project_id=p1.id,
        sender_id=f1.id,
        receiver_id=client.id,
        content="Thanks Sarah! I've already initialized the FastAPI skeleton and the embedding pipeline. Will submit Milestone 1 shortly for your review.",
        is_read=True
    )
    db.add_all([msg1, msg2])

    print("[OK] Demo database successfully seeded with clients, freelancers, projects, and milestones.")
