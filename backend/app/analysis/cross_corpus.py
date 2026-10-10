import uuid
import numpy as np
from typing import List, Tuple
from app.api.schemas import ResearchPaper, Patent, CrossCorpusRelationship, EvidenceRecord
from app.retrieval.embeddings import EmbeddingGenerator
from app.logging_config import logger

class CrossCorpusAnalyzer:
    """Analyzes and detects paper-paper, patent-patent, and paper-patent relationships."""
    def __init__(self, embedding_generator: EmbeddingGenerator = None):
        self.encoder = embedding_generator or EmbeddingGenerator()

    def analyze_relationships(
        self,
        papers: List[ResearchPaper],
        patents: List[Patent],
        similarity_threshold: float = 0.25
    ) -> Tuple[List[CrossCorpusRelationship], List[EvidenceRecord]]:
        relationships: List[CrossCorpusRelationship] = []
        evidence_list: List[EvidenceRecord] = []

        paper_texts = [f"{p.title}. {p.abstract or ''}" for p in papers]
        patent_texts = [f"{p.title}. {p.abstract or ''} {' '.join(p.claims or [])}" for p in patents]

        paper_vecs = self.encoder.encode(paper_texts) if paper_texts else np.zeros((0, 384))
        patent_vecs = self.encoder.encode(patent_texts) if patent_texts else np.zeros((0, 384))

        # 1. Paper-to-Paper Relationships
        for i in range(len(papers)):
            for j in range(i + 1, len(papers)):
                p1, p2 = papers[i], papers[j]
                sim = float(np.dot(paper_vecs[i], paper_vecs[j]))
                
                # Check explicit reference or high similarity
                is_cited = p2.paper_id in p1.references or p1.paper_id in p2.references
                if sim >= similarity_threshold or is_cited:
                    ev_id = f"EV-PP-{uuid.uuid4().hex[:6]}"
                    ev = EvidenceRecord(
                        evidence_id=ev_id,
                        document_id=p1.paper_id,
                        document_type="paper",
                        passage_text=f"Shared conceptual focus between '{p1.title}' and '{p2.title}' (Cosine: {sim:.3f})",
                        source_url=p1.source_url,
                        evidence_type="method",
                        extraction_method="cross_corpus_embedding_similarity",
                        confidence=min(1.0, max(0.5, sim))
                    )
                    evidence_list.append(ev)

                    rel = CrossCorpusRelationship(
                        relationship_id=f"REL-PP-{uuid.uuid4().hex[:6]}",
                        source_entity_id=p1.paper_id,
                        target_entity_id=p2.paper_id,
                        relationship_type="paper-to-paper",
                        score=round(sim, 3),
                        supporting_evidence_ids=[ev_id],
                        extraction_method="citation_and_semantic_similarity",
                        confidence=round(sim, 2)
                    )
                    relationships.append(rel)

        # 2. Patent-to-Patent Relationships
        for i in range(len(patents)):
            for j in range(i + 1, len(patents)):
                pt1, pt2 = patents[i], patents[j]
                sim = float(np.dot(patent_vecs[i], patent_vecs[j]))
                shared_cpc = set(pt1.classifications).intersection(set(pt2.classifications))
                
                if sim >= similarity_threshold or shared_cpc:
                    ev_id = f"EV-TT-{uuid.uuid4().hex[:6]}"
                    ev = EvidenceRecord(
                        evidence_id=ev_id,
                        document_id=pt1.patent_id,
                        document_type="patent",
                        passage_text=f"Patent overlap in classifications {list(shared_cpc)} (Cosine: {sim:.3f})",
                        source_url=pt1.source_url,
                        evidence_type="solution",
                        extraction_method="classification_and_claims_similarity",
                        confidence=min(1.0, max(0.5, sim))
                    )
                    evidence_list.append(ev)

                    rel = CrossCorpusRelationship(
                        relationship_id=f"REL-TT-{uuid.uuid4().hex[:6]}",
                        source_entity_id=pt1.patent_id,
                        target_entity_id=pt2.patent_id,
                        relationship_type="patent-to-patent",
                        score=round(sim, 3),
                        supporting_evidence_ids=[ev_id],
                        extraction_method="cpc_classification_and_claims_matching",
                        confidence=round(sim, 2)
                    )
                    relationships.append(rel)

        # 3. Paper-to-Patent Relationships
        for i in range(len(papers)):
            for j in range(len(patents)):
                p = papers[i]
                pt = patents[j]
                sim = float(np.dot(paper_vecs[i], patent_vecs[j]))
                is_cited = p.paper_id in pt.citations or pt.patent_id in p.references

                if sim >= similarity_threshold or is_cited:
                    ev_id = f"EV-PT-{uuid.uuid4().hex[:6]}"
                    ev = EvidenceRecord(
                        evidence_id=ev_id,
                        document_id=pt.patent_id,
                        document_type="patent",
                        passage_text=f"Cross-corpus technical linkage between paper '{p.title}' and patent claim in '{pt.title}' (Cosine: {sim:.3f})",
                        source_url=pt.source_url,
                        evidence_type="solution",
                        extraction_method="paper_patent_cross_embedding",
                        confidence=min(1.0, max(0.5, sim))
                    )
                    evidence_list.append(ev)

                    rel = CrossCorpusRelationship(
                        relationship_id=f"REL-PT-{uuid.uuid4().hex[:6]}",
                        source_entity_id=p.paper_id,
                        target_entity_id=pt.patent_id,
                        relationship_type="paper-to-patent",
                        score=round(sim, 3),
                        supporting_evidence_ids=[ev_id],
                        extraction_method="cross_corpus_semantic_matching",
                        confidence=round(sim, 2)
                    )
                    relationships.append(rel)

        logger.info(f"CrossCorpusAnalyzer extracted {len(relationships)} relationships across {len(papers)} papers and {len(patents)} patents.")
        return relationships, evidence_list
