# Standard library
import os
from collections.abc import Generator

# Third-party
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base
from dotenv import load_dotenv


# Load environment variables before reading DB settings.
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """Yield a database session and ensure it is properly closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
