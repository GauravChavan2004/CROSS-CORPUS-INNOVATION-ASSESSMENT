from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.schemas import AnalysisRequest, AnalysisResponse, ResearchPaper, Patent
from app.services.analysis_pipeline import AnalysisPipelineService
from app.database.session import get_db
from app.database.repository import AnalysisRepository
from app.logging_config import logger

from app.services.health_check import check_openalex_health, check_epo_health

router = APIRouter()
pipeline_service = AnalysisPipelineService()
repo = AnalysisRepository()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Cross-Corpus Innovation Assessment API",
        "embedding_model": pipeline_service.encoder.model_name
    }

@router.get("/health/diagnostics")
def api_diagnostics():
    openalex_res = check_openalex_health()
    epo_res = check_epo_health()
    return {
        "status": "success",
        "openalex": openalex_res,
        "epo_ops": epo_res
    }

@router.post("/ideas/analyze", response_model=AnalysisResponse)
def analyze_idea(request: AnalysisRequest, db: Session = Depends(get_db)):
    try:
        response = pipeline_service.run_analysis(request)
        repo.save_analysis(db, response)
        return response
    except Exception as e:
        logger.error(f"Error executing analysis pipeline: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    res = repo.get_analysis(db, analysis_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Analysis ID '{analysis_id}' not found.")
    return res

@router.get("/analyses/{analysis_id}/evidence")
def get_analysis_evidence(analysis_id: str, db: Session = Depends(get_db)):
    res = repo.get_analysis(db, analysis_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Analysis ID '{analysis_id}' not found.")
    return {"analysis_id": analysis_id, "evidence": res.evidence}

@router.post("/search/papers")
def search_papers(query: str = Query(..., min_length=2), top_k: int = Query(5, ge=1)):
    papers = pipeline_service.paper_adapter.fetch_papers(query, limit=top_k)
    return {"query": query, "count": len(papers), "results": papers}

@router.post("/search/patents")
def search_patents(query: str = Query(..., min_length=2), top_k: int = Query(5, ge=1)):
    patents = pipeline_service.patent_adapter.fetch_patents(query, limit=top_k)
    return {"query": query, "count": len(patents), "results": patents}
