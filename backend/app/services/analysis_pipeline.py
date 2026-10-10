import uuid
import os
import json
from typing import List
from app.api.schemas import AnalysisRequest, AnalysisResponse
from app.config import settings
from app.analysis.query_parser import QueryParser
from app.ingestion.mock_data import save_fixtures
from app.ingestion.papers import MockPaperAdapter, OpenAlexPaperAdapter
from app.ingestion.patents import MockPatentAdapter, EPOPatentAdapter
from app.ingestion.preprocessing import preprocess_papers, preprocess_patents
from app.retrieval.bm25 import BM25Retriever
from app.retrieval.embeddings import EmbeddingGenerator
from app.retrieval.vector_index import VectorIndex
from app.retrieval.fusion import reciprocal_rank_fusion
from app.analysis.cross_corpus import CrossCorpusAnalyzer
from app.analysis.rationale_extraction import RationaleExtractor
from app.analysis.gap_detection import GapDetector
from app.analysis.innovation_scoring import MultidimensionalScorer
from app.analysis.opportunity_generation import OpportunityGenerator
from app.services.evidence_validation import EvidenceValidationService
from app.logging_config import logger

class AnalysisPipelineService:
    """Master Pipeline Service orchestrating full end-to-end evidence-grounded innovation analysis."""

    def __init__(self):
        fixture_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "fixtures")
        os.makedirs(fixture_dir, exist_ok=True)
        papers_file = os.path.join(fixture_dir, "papers.json")
        patents_file = os.path.join(fixture_dir, "patents.json")

        if not os.path.exists(papers_file) or not os.path.exists(patents_file):
            save_fixtures(fixture_dir)

        # Initialize Adapters based on DATA_MODE
        self.data_mode = settings.DATA_MODE
        if self.data_mode == "live":
            logger.info("Initializing Pipeline in LIVE DATA MODE (OpenAlex + EPO OPS APIs)")
            self.paper_adapter = OpenAlexPaperAdapter()
            self.patent_adapter = EPOPatentAdapter()
        else:
            logger.info("Initializing Pipeline in MOCK DATA MODE (Local Fixtures)")
            self.paper_adapter = MockPaperAdapter(papers_file)
            self.patent_adapter = MockPatentAdapter(patents_file)
        
        self.query_parser = QueryParser()
        self.encoder = EmbeddingGenerator()
        self.bm25_retriever = BM25Retriever()
        self.vector_index = VectorIndex(self.encoder)
        
        self.cross_corpus_analyzer = CrossCorpusAnalyzer(self.encoder)
        self.rationale_extractor = RationaleExtractor()
        self.gap_detector = GapDetector()
        self.scorer = MultidimensionalScorer()
        self.opportunity_generator = OpportunityGenerator()
        self.validator = EvidenceValidationService()

    def run_analysis(self, request: AnalysisRequest) -> AnalysisResponse:
        analysis_id = f"ANALYSIS-{uuid.uuid4().hex[:8]}"
        logger.info(f"Starting pipeline run {analysis_id} (data_mode={self.data_mode}) for query: {request.idea_text[:60]}")

        pipeline_warnings: List[str] = []

        # 1. Parse Idea
        parsed_idea = self.query_parser.parse_idea(request)

        # 2. Fetch raw papers and patents
        raw_papers = self.paper_adapter.fetch_papers(request.idea_text, limit=request.top_k * 2)
        raw_patents = self.patent_adapter.fetch_patents(request.idea_text, limit=request.top_k * 2)

        paper_success = len(raw_papers) > 0
        patent_success = len(raw_patents) > 0

        if not paper_success:
            pipeline_warnings.append(f"Paper provider ({self.paper_adapter.__class__.__name__}) returned 0 results or failed.")
        if not patent_success:
            pipeline_warnings.append(f"Patent provider ({self.patent_adapter.__class__.__name__}) returned 0 results or failed.")

        # Determine overall status
        if paper_success and patent_success:
            run_status = "success"
        elif paper_success or patent_success:
            run_status = "partial_success"
        else:
            run_status = "failed"

        # 3. Preprocessing & Data Profiling
        clean_papers, paper_profile = preprocess_papers(raw_papers)
        clean_patents, patent_profile = preprocess_patents(raw_patents)

        # If both corpora are empty, return early failed response without crashing
        if not clean_papers and not clean_patents:
            return AnalysisResponse(
                analysis_id=analysis_id,
                status="failed",
                parsed_idea=parsed_idea,
                papers=[],
                patents=[],
                relationships=[],
                gaps=[],
                recommendations=[],
                evidence=[],
                metadata={
                    "data_mode": self.data_mode,
                    "paper_provider": self.paper_adapter.__class__.__name__,
                    "patent_provider": self.patent_adapter.__class__.__name__,
                    "error": "No documents retrieved from either paper or patent APIs."
                },
                warnings=pipeline_warnings
            )

        # 4. Keyword & Semantic Retrieval (BM25 + FAISS + RRF)
        self.bm25_retriever.index_documents(clean_papers, clean_patents)
        self.vector_index.index_documents(clean_papers, clean_patents)

        bm25_results = self.bm25_retriever.search(request.idea_text, top_k=request.top_k * 2)
        vector_results = self.vector_index.search(request.idea_text, top_k=request.top_k * 2)

        fused_results = reciprocal_rank_fusion([bm25_results, vector_results], top_n=request.top_k * 2)
        fused_ids = {r[0] for r in fused_results}

        retrieved_papers = [p for p in clean_papers if p.paper_id in fused_ids][:request.top_k]
        retrieved_patents = [pt for pt in clean_patents if pt.patent_id in fused_ids][:request.top_k]

        if not retrieved_papers and clean_papers:
            retrieved_papers = clean_papers[:request.top_k]
        if not retrieved_patents and clean_patents:
            retrieved_patents = clean_patents[:request.top_k]

        # 5. Cross-Corpus Matching
        relationships, cc_evidence = self.cross_corpus_analyzer.analyze_relationships(
            retrieved_papers, retrieved_patents
        )

        # 6. Structured Rationale Extraction
        paper_rationales, p_ev = self.rationale_extractor.extract_from_papers(retrieved_papers)
        patent_rationales, pt_ev = self.rationale_extractor.extract_from_patents(retrieved_patents)

        all_evidence = cc_evidence + p_ev + pt_ev

        # 7. Idea-Conditioned Gap Detection
        candidate_gaps = self.gap_detector.detect_gaps(
            parsed_idea, paper_rationales, patent_rationales, all_evidence
        )

        # 8. Multidimensional Scoring
        scores_by_gap = {}
        for gap in candidate_gaps:
            scores_by_gap[gap.gap_id] = self.scorer.score_opportunity(gap, relationships, all_evidence)

        # 9. Recommendation Generation
        recommendations = self.opportunity_generator.generate_recommendations(
            parsed_idea, candidate_gaps, scores_by_gap, all_evidence
        )

        # 10. Strict Evidence Validation
        validated_gaps, validated_recs, validation_warnings = self.validator.validate_analysis_evidence(
            retrieved_papers, retrieved_patents, all_evidence, candidate_gaps, recommendations
        )
        pipeline_warnings.extend(validation_warnings)

        response = AnalysisResponse(
            analysis_id=analysis_id,
            status=run_status,
            parsed_idea=parsed_idea,
            papers=retrieved_papers,
            patents=retrieved_patents,
            relationships=relationships,
            gaps=validated_gaps,
            recommendations=validated_recs,
            evidence=all_evidence,
            metadata={
                "data_mode": self.data_mode,
                "paper_provider": self.paper_adapter.__class__.__name__,
                "patent_provider": self.patent_adapter.__class__.__name__,
                "paper_preprocessing_profile": paper_profile,
                "patent_preprocessing_profile": patent_profile,
                "embedding_model": self.encoder.model_name,
                "retrieval_method": "Hybrid BM25 + FAISS (RRF)",
                "total_relationships_found": len(relationships),
                "total_evidence_passages": len(all_evidence)
            },
            warnings=pipeline_warnings
        )

        logger.info(f"Pipeline run {analysis_id} completed with status='{run_status}'.")
        return response
