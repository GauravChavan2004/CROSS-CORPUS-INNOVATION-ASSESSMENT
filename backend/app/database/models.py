from sqlalchemy import Column, String, Integer, Float, Text, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone

Base = declarative_base()

class DBAnalysisRun(Base):
    __tablename__ = "analysis_runs"

    analysis_id = Column(String, primary_key=True, index=True)
    status = Column(String, default="success")
    idea_id = Column(String, index=True)
    original_text = Column(Text)
    domain = Column(String)
    proposed_technology = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    raw_response_json = Column(Text)
