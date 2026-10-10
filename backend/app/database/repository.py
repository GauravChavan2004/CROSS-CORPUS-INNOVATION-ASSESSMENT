import json
from typing import Optional
from sqlalchemy.orm import Session
from app.database.models import DBAnalysisRun
from app.api.schemas import AnalysisResponse
from app.logging_config import logger

class AnalysisRepository:
    """Database repository for persisting and retrieving analysis runs."""

    def save_analysis(self, db: Session, response: AnalysisResponse) -> DBAnalysisRun:
        db_run = DBAnalysisRun(
            analysis_id=response.analysis_id,
            status=response.status,
            idea_id=response.parsed_idea.idea_id,
            original_text=response.parsed_idea.original_text,
            domain=response.parsed_idea.domain,
            proposed_technology=response.parsed_idea.proposed_technology,
            raw_response_json=json.dumps(response.model_dump(), default=str)
        )
        db.add(db_run)
        db.commit()
        db.refresh(db_run)
        logger.info(f"Saved analysis run {response.analysis_id} to database.")
        return db_run

    def get_analysis(self, db: Session, analysis_id: str) -> Optional[AnalysisResponse]:
        db_run = db.query(DBAnalysisRun).filter(DBAnalysisRun.analysis_id == analysis_id).first()
        if not db_run or not db_run.raw_response_json:
            return None
        data = json.loads(db_run.raw_response_json)
        return AnalysisResponse(**data)
