from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import json

DATABASE_URL = "sqlite:///./phishguard.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    target = Column(String, index=True)
    source = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    risk = Column(String)
    score = Column(Float)
    result = Column(String)
    tactics = Column(String) # Stored as JSON string
    explanation = Column(String)
    urls = Column(String) # Stored as JSON string

# Automatically create tables when imported
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
