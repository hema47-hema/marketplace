import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import DATABASE_URL

logger = logging.getLogger("marketplace.database")
logging.basicConfig(level=logging.INFO)

Base = declarative_base()

def init_engine():
    # First try PostgreSQL if specified
    if DATABASE_URL.startswith("postgresql"):
        try:
            connect_args = {"connect_timeout": 8}
            # Supabase and managed cloud databases require SSL
            if "supabase.co" in DATABASE_URL or "pooler.supabase.com" in DATABASE_URL:
                connect_args["sslmode"] = "require"

            test_engine = create_engine(
                DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=300,
                connect_args=connect_args
            )
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to PostgreSQL (Supabase) database!")
            return test_engine
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection failed ({e}). "
                "Falling back to SQLite database "
                "to guarantee zero runtime disruption."
            )
    
    # SQLite fallback
    if os.getenv("VERCEL"):
        sqlite_url = "sqlite:////tmp/marketplace.db"
    else:
        sqlite_url = "sqlite:///./marketplace.db"
    return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
