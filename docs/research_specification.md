# Research Specification & Requirement Traceability Matrix

**Project Title:** An Evidence-Grounded AI Framework for Cross-Corpus Innovation Assessment and Recommendation Using Research Papers and Patents  
**Domain:** Artificial Intelligence, Natural Language Processing, Semantic Retrieval, Research-Gap Detection, Patent Analysis, Innovation Assessment, Knowledge Integration, RAG, Explainable Recommendation.

---

## 1. Requirement Traceability Matrix (RTM)

| Objective ID | Research Objective Description | Implemented Components | Automated Tests | Evaluation Methods | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **O1** | Develop a cross-corpus framework that retrieves and connects relevant research papers and patents and assesses novelty-related and prior-art relationships for a given research idea. | `ingestion/` (Paper/Patent Adapters)<br>`retrieval/` (BM25, Embedding, FAISS, RRF)<br>`analysis/cross_corpus.py` | `tests/unit/test_retrieval.py`<br>`tests/unit/test_cross_corpus.py`<br>`tests/integration/test_ingestion_retrieval.py` | Retrieval Precision@K, Recall@K, NDCG@K;<br>Cross-corpus matching Precision, Recall, F1 against annotated links | Retrieval returns top-K documents from both corpora; cross-corpus links identify paper-paper, patent-patent, and paper-patent relationships with confidence scores. |
| **O2** | Develop a multidimensional innovation assessment mechanism considering contextual relevance, limitations, feasibility, evidence strength, gap strength, differentiation, and novelty potential. | `analysis/innovation_scoring.py`<br>`api/schemas.py` | `tests/unit/test_scoring.py` | Human ratings for relevance, novelty potential, feasibility, differentiation, evidence support; comparison vs similarity-only ranking | Calculates normalized (0–100) sub-scores across all 6 dimensions with configurable weights; produces robust candidate ranking. |
| **O3** | Develop an idea-conditioned cross-corpus research-gap detection mechanism for identifying unresolved problems, technological limitations, and potential innovation opportunities from papers and patents. | `analysis/rationale_extraction.py`<br>`analysis/gap_detection.py` | `tests/unit/test_gap_detection.py`<br>`tests/unit/test_rationale_extraction.py` | Precision, recall, and F1 against annotated gaps; review of false positives, false negatives, and contradictory evidence | Candidate gaps combine limitations from papers and patents, state reasoning, supporting/contradictory evidence, and remain conditioned on user idea. |
| **O4** | Generate grounded, explainable, and actionable innovation recommendations supported by traceable evidence from relevant research papers and patents. | `analysis/opportunity_generation.py`<br>`services/evidence_validation.py`<br>`llm/provider.py` | `tests/unit/test_recommendation_validation.py`<br>`tests/integration/test_pipeline.py` | Evidence support rate, invalid citation rate (0%), unsupported-claim rate, evidence coverage, human assessment of usefulness | Every claim in generated recommendations resolves to valid document passages; unknown/fabricated IDs are rejected by validation layer. |

---

## 2. Identified Missing Decisions & Configuration Placeholders

The framework maintains explicit placeholders for runtime configuration and environment settings:

- `[PROJECT_WORKSPACE_PATH]`: `d:\James\Research Project Imp`
- `[RESEARCH_DOMAIN_OR_TEST_DOMAIN]`: AI & NLP for Science & Patent Analysis
- `[PAPER_DATASET_LINK_OR_FILE]`: Candidate live connectors: Semantic Scholar API / OpenAlex API. Offline fixtures: `data/fixtures/papers.json`
- `[PATENT_DATASET_LINK_OR_FILE]`: Candidate live connectors: PatentsView / Google Patents / The Lens. Offline fixtures: `data/fixtures/patents.json`
- `[EMBEDDING_MODEL_PREFERENCE]`: `sentence-transformers/all-MiniLM-L6-v2` (Local HuggingFace model)
- `[LLM_PROVIDER_AND_MODEL]`: Configurable interface (`mock` default for deterministic testing, `openai`/`anthropic` for production)
- `[DATABASE_PREFERENCE]`: SQLite for local prototype (`sqlite:///./innovation_system.db`)
- `[AVAILABLE_RAM_GPU_AND_STORAGE]`: System CPU/RAM standard environment

---

## 3. System Architecture & Evaluation Baselines

### Evaluation Baselines (B1 - B5 vs Proposed P1)
- **B1**: Keyword-based retrieval (BM25 only)
- **B2**: Semantic similarity-based retrieval (Embeddings + Cosine similarity only)
- **B3**: Research-paper-only gap detection (Excludes patent evidence)
- **B4**: Paper and patent retrieval without rationale analysis (Raw text without structured extraction)
- **B5**: LLM-based recommendation without explicit evidence grounding (Direct prompt without validated RAG passages)
- **P1**: Proposed Cross-Corpus Evidence-Grounded Framework (Hybrid BM25+FAISS, Rationale Extraction, Cross-Corpus Matching, Multidimensional Scoring, Validated RAG Evidence)

---

## 4. Legal & Operational Disclaimer
*The system is a research and decision-support prototype. It MUST NOT claim to establish legal patentability, legal freedom to operate, automated patent filing, or guaranteed commercial success. It clearly distinguishes preliminary computational assessments from decisions requiring legal, technical, intellectual-property, or commercial expertise.*
