from typing import List, Tuple, Dict, Set
from app.api.schemas import RecommendationRecord, CandidateGap, EvidenceRecord, ResearchPaper, Patent
from app.logging_config import logger

class EvidenceValidationService:
    """Strict post-generation evidence grounding & citation validation service."""

    def validate_analysis_evidence(
        self,
        papers: List[ResearchPaper],
        patents: List[Patent],
        evidence_pool: List[EvidenceRecord],
        gaps: List[CandidateGap],
        recommendations: List[RecommendationRecord]
    ) -> Tuple[List[CandidateGap], List[RecommendationRecord], List[str]]:
        warnings = []
        valid_doc_ids: Set[str] = {p.paper_id for p in papers}.union({pt.patent_id for pt in patents})
        valid_ev_ids: Set[str] = {e.evidence_id for e in evidence_pool}

        # 1. Validate Evidence Pool documents
        clean_evidence_pool = []
        for ev in evidence_pool:
            if ev.document_id not in valid_doc_ids:
                warnings.append(f"Evidence {ev.evidence_id} references non-existent document ID: {ev.document_id}. Rejected.")
            else:
                clean_evidence_pool.append(ev)

        # 2. Validate Gap Evidence References
        for gap in gaps:
            invalid_ids = [eid for eid in gap.supporting_evidence_ids if eid not in valid_ev_ids]
            if invalid_ids:
                warnings.append(f"Gap {gap.gap_id} referenced ungrounded evidence IDs: {invalid_ids}. Stripped.")
                gap.supporting_evidence_ids = [eid for eid in gap.supporting_evidence_ids if eid in valid_ev_ids]

        # 3. Validate Recommendation Evidence References
        for rec in recommendations:
            invalid_ids = [eid for eid in rec.supporting_evidence_ids if eid not in valid_ev_ids]
            if invalid_ids:
                warnings.append(f"Recommendation {rec.recommendation_id} referenced ungrounded evidence IDs: {invalid_ids}. Stripped.")
                rec.supporting_evidence_ids = [eid for eid in rec.supporting_evidence_ids if eid in valid_ev_ids]

        logger.info(f"EvidenceValidationService validated {len(evidence_pool)} evidence records with {len(warnings)} warnings.")
        return gaps, recommendations, warnings
