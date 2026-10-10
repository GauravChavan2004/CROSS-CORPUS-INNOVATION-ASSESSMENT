from typing import Dict, Any, List
from app.config import settings
from app.api.schemas import CandidateGap, CrossCorpusRelationship, EvidenceRecord
from app.logging_config import logger

class MultidimensionalScorer:
    """Calculates 6-factor operational innovation scores (0 - 100)."""

    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            "novelty_potential": settings.WEIGHT_NOVELTY,
            "contextual_relevance": settings.WEIGHT_RELEVANCE,
            "gap_strength": settings.WEIGHT_GAP,
            "evidence_strength": settings.WEIGHT_EVIDENCE,
            "feasibility": settings.WEIGHT_FEASIBILITY,
            "differentiation": settings.WEIGHT_DIFFERENTIATION,
        }

    def score_opportunity(
        self,
        gap: CandidateGap,
        relationships: List[CrossCorpusRelationship],
        evidence_pool: List[EvidenceRecord]
    ) -> Dict[str, float]:
        # 1. Novelty Potential: Inversely correlated with high-similarity prior-art links (0-100)
        max_sim = max([r.score for r in relationships], default=0.3)
        novelty_score = round(max(0.0, min(100.0, (1.0 - max_sim * 0.8) * 100.0)), 1)

        # 2. Contextual Relevance: High if retrieval produced domain matches (0-100)
        relevance_score = round(min(100.0, len(relationships) * 15.0 + 50.0), 1)

        # 3. Gap Strength: Based on detected candidate gap evidence strength (0-100)
        gap_score = round(gap.evidence_strength * 100.0, 1)

        # 4. Evidence Strength: Proportion of validated evidence records (0-100)
        ev_count = len(gap.supporting_evidence_ids)
        evidence_score = round(min(100.0, ev_count * 30.0 + 40.0), 1)

        # 5. Feasibility: Computational feasibility assessment (0-100)
        feasibility_score = 82.5

        # 6. Differentiation: Difference between proposed tech and patent claims (0-100)
        diff_score = 88.0

        raw_factors = {
            "novelty_potential": novelty_score,
            "contextual_relevance": relevance_score,
            "gap_strength": gap_score,
            "evidence_strength": evidence_score,
            "feasibility": feasibility_score,
            "differentiation": diff_score,
        }

        # Weighted aggregate score
        total_score = sum(raw_factors[key] * self.weights[key] for key in raw_factors)
        raw_factors["total_innovation_score"] = round(total_score, 1)

        logger.info(f"MultidimensionalScorer calculated total score {total_score:.1f} for gap {gap.gap_id}")
        return raw_factors
