# System Models & Tech Stack Specification

**Project Title:** Evidence-Grounded AI Framework for Cross-Corpus Innovation Assessment  
**Document Purpose:** Detailed technical reference of all models, algorithms, frameworks, and technologies utilized across the system.

---

## 🤖 1. System Models Architecture

### A. Artificial Intelligence & NLP Models
1. **Sentence Embedding Model (`sentence-transformers/all-MiniLM-L6-v2`)**
   * **Framework:** Hugging Face `sentence-transformers`
   * **Vector Dimension:** 384 dimensions
   * **Purpose:** Encodes research paper abstracts, patent claims, and user innovation proposals into dense vector representations for fast semantic similarity searching.

2. **Large Language Model (LLM)**
   * **Configured Model:** `gpt-4o-mini` (Configurable via `LLM_MODEL_NAME` in `app/config.py`)
   * **Provider Interface:** Multi-provider architecture (`mock` for deterministic testing/offline mode, `openai`, or `anthropic`)
   * **Purpose:** Performs structured rationale extraction, problem-claim relation extraction, and natural language synthesis for innovation opportunity recommendations.

---

### B. Algorithmic & Information Retrieval (IR) Models
3. **BM25 Keyword Retrieval Model**
   * **Library:** `rank-bm25` (Okapi BM25 implementation)
   * **Purpose:** Sparse term-matching retrieval model designed to locate exact key terms across paper titles/abstracts and patent claim texts.

4. **FAISS Vector Index Model**
   * **Library:** `faiss-cpu` (Facebook AI Similarity Search)
   * **Index Type:** Dense Vector Index (L2 / Cosine Similarity)
   * **Purpose:** High-performance, scalable semantic search index for dense embeddings.

5. **Reciprocal Rank Fusion (RRF) Model**
   * **Algorithm:** Reciprocal Rank Fusion ($RRF\_Score(d) = \sum \frac{1}{k + r(d)}$)
   * **Purpose:** Combines sparse BM25 keyword rankings with dense FAISS semantic similarity rankings to form a unified, hybrid candidate retrieval list.

6. **6-Factor Operational Innovation Scoring Model**
   * **Formula:** Composite weighted rubric assessing candidate innovation ideas across 6 operational dimensions:
     1. **Novelty Potential ($N$)**: $25\%$ weight – Inverse similarity to existing prior-art patent claims.
     2. **Contextual Relevance ($R$)**: $20\%$ weight – Alignment between literature domain and proposed technique.
     3. **Gap Strength ($G$)**: $20\%$ weight – Quantitative density of unresolved scientific/technical constraints.
     4. **Evidence Strength ($E$)**: $15\%$ weight – Ratio of non-hallucinated, verified supporting passages.
     5. **Feasibility ($F$)**: $10\%$ weight – Practical computational & technical viability.
     6. **Differentiation ($D$)**: $10\%$ weight – Extent to which the idea bypasses known patent claim boundaries.

---

### C. Data & Database Models
7. **SQLAlchemy DB Model (`DBAnalysisRun`)**
   * **Table Name:** `analysis_runs`
   * **Columns:** `analysis_id`, `status`, `idea_id`, `original_text`, `domain`, `proposed_technology`, `created_at`, `raw_response_json`
   * **Purpose:** Manages execution history, run metadata, and raw output responses in SQLite.

8. **Pydantic Schema Models (`app/api/schemas.py`)**
   * **Models:** `ResearchPaper`, `Patent`, `AnalysisRequest`, `AnalysisResponse`, `InnovationOpportunity`, `EvidencePassage`, `ResearchGap`, `CrossCorpusRelationship`
   * **Purpose:** Provides strict type safety, input/output serialization, and validation for API requests and pipeline stages.

---

## 🛠️ 2. Technology Stack

| Category | Technology / Library | Version / Details | Purpose & Scope |
| :--- | :--- | :--- | :--- |
| **Backend Core** | **Python** | 3.10+ (Python 3.13 tested) | Core application logic and data processing engine |
| **API Framework** | **FastAPI** | `>=0.110.0` | Asynchronous high-performance REST API endpoints |
| **ASGI Server** | **Uvicorn** | `>=0.28.0` | Lightning-fast ASGI server implementation |
| **Settings & Schemas**| **Pydantic / Pydantic-Settings** | `>=2.6.0` | Data validation, serialization, and `.env` parsing |
| **Database & ORM** | **SQLite + SQLAlchemy** | `>=2.0.28` | Relational storage for analysis history and metadata |
| **Vector Search** | **FAISS (`faiss-cpu`)** | `>=1.8.0` | High-efficiency dense vector index and retrieval |
| **Keyword Search** | **Rank-BM25** | `>=0.2.2` | Okapi BM25 ranking algorithm for term matching |
| **NLP & Transformers** | **Sentence-Transformers** | `>=2.6.0` | PyTorch/HuggingFace dense embedding extraction |
| **Graph Processing** | **NetworkX** | `>=3.2.1` | Cross-corpus paper-patent relation graph analytics |
| **Data Analytics** | **NumPy & Pandas** | `>=1.26.0` / `>=2.2.0` | Vector operations, array manipulation, data structures |
| **Testing** | **PyTest** | `>=8.0.0` | Automated unit testing and evaluation scripts |
| **Frontend UI** | **React** | `^18.2.0` | Component-based interactive dashboard UI |
| **Frontend Build** | **Vite** | `^5.1.4` | Fast frontend bundler and HMR dev server |
| **UI Iconography** | **Lucide React** | `^0.344.0` | Modern SVG icons for dashboard interface |
| **UI Design & Theme**| **Vanilla CSS3** | Custom Obsidian Dark Theme | Glassmorphic design system, responsive layout, dark theme |

---

## 📁 Document Location
Saved in project repository at: `docs/MODELS_AND_TECH_STACK.md`
