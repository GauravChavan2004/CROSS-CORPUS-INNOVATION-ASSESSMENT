# System Architecture Specification

## 1. High-Level Pipeline Flow Architecture

```
                               ┌───────────────────────────────────┐
                               │       User Research Idea          │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │           Query Parser            │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                   ┌───────────────────────────────────────────────────────────┐
                   │                     DATA_MODE Router                      │
                   └──────────────┬─────────────────────────────┬──────────────┘
                                  │                             │
                   DATA_MODE=live │                             │ DATA_MODE=mock
                                  ▼                             ▼
             ┌───────────────────────────────┐     ┌───────────────────────────┐
             │ OpenAlex API (Papers)         │     │ Mock Paper Fixture        │
             │ EPO OPS API (Patents)         │     │ Mock Patent Fixture       │
             └──────────────┬────────────────┘     └────────────┬──────────────┘
                            │                                   │
                            └─────────────────┬─────────────────┘
                                              │
                                              ▼
                               ┌───────────────────────────────────┐
                               │  Normalization & Profile Logging  │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │           Deduplication           │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │ Hybrid Candidate Retrieval        │
                               │ (BM25 + FAISS Vector Embeddings)  │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │     Reciprocal Rank Fusion (RRF)  │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │ Cross-Corpus Matching Engine      │
                               │ (Paper-to-Patent Relationships)   │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │ Rationale & Evidence Extractor    │
                               │ (Limitations, Solutions, Methods) │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │ Idea-Conditioned Gap Detection    │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │ 6-Factor Innovation Scorer (N,R,G)│
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │ Evidence-Grounded Recommendations │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │ Strict Evidence Validator         │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 ▼
                               ┌───────────────────────────────────┐
                               │ Interactive React Dashboard +     │
                               │ 3D Animated Universe Canvas       │
                               └───────────────────────────────────┘
```

---

## 2. Operational Modes

### MOCK MODE (`DATA_MODE=mock`)
- **Purpose**: Offline development, unit testing, deterministic evaluation, and CI pipelines without API key dependencies.
- **Data Source**: Local JSON fixtures (`data/fixtures/papers.json` & `data/fixtures/patents.json`).
- **Behavior**: Deterministic mock paper and patent datasets with pre-calculated claims and keywords.

### LIVE MODE (`DATA_MODE=live`)
- **Purpose**: Real-world cross-corpus innovation assessment.
- **Data Sources**:
  - Research Papers: **OpenAlex API** (`https://api.openalex.org/works`)
  - Patents: **European Patent Office OPS API** (`https://ops.epo.org/3.2/rest-services/published-data/search`)
- **Behavior**: Calls external APIs live, reconstructs abstracts from OpenAlex inverted index, retrieves EPO OPS publication records, preserves exact provider provenance, handles partial success gracefully (`status="partial_success"`).

---

## 3. Core Framework Modules

1. **`app.ingestion`**: Adapters for OpenAlex, EPO OPS (with OAuth caching), and Mock fixtures.
2. **`app.retrieval`**: BM25 keyword indexer, FAISS dense vector retriever (SentenceTransformer `all-MiniLM-L6-v2`), and RRF rank fusion.
3. **`app.analysis`**: Query parsing, cross-corpus similarity matrix computation, rationale extraction, gap detection, and 6-factor scoring ($N, R, G, E, F, D$).
4. **`app.services`**: `AnalysisPipelineService` orchestrator & `EvidenceValidationService`.
5. **`app.api`**: FastAPI endpoints (`/api/ideas/analyze`, `/api/health`, `/api/search/papers`, `/api/search/patents`).
