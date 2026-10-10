# Evidence-Grounded AI Framework for Cross-Corpus Innovation Assessment

An end-to-end, evidence-grounded AI decision-support platform that jointly analyzes research papers and patent literature to identify unexploited research gaps, prior-art boundaries, and multidimensional innovation opportunities.

---

## 🌟 Executive Summary

Traditional innovation analysis operates in domain silos: academic literature focuses on fundamental scientific discoveries, while patent databases emphasize commercial claims and prior art. This platform bridges the gap by implementing a **Cross-Corpus Retrieval & Analysis Pipeline** that grounds every innovation recommendation in traceable passages from both live OpenAlex paper literature and European Patent Office (EPO OPS) patent records.

---

## 🏗️ System Architecture & Live Data Integration

```
                                    +------------------------------+
                                    |     User Research Idea       |
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    |   Query Parser & Schema      |
                                    +--------------+---------------+
                                                   |
                                                   v
                    +------------------------------+------------------------------+
                    | Live Data Mode:                             | Mock Data Mode:
                    v                                             v
     +--------------+---------------+             +---------------+--------------+
     | OpenAlex API (Papers)        |             | Mock Paper Fixture           |
     | EPO OPS API (Patents)        |             | Mock Patent Fixture          |
     +--------------+---------------+             +---------------+--------------+
                    |                                             |
                    +------------------------------+--------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    | BM25 + FAISS Hybrid Ranking  |
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    | Reciprocal Rank Fusion (RRF) |
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    | Cross-Corpus Analyzer        |
                                    | (Paper-Patent Linkages)      |
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    | Structured Rationale Extractor|
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    | Idea-Conditioned Gap Detector |
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    | 6-Factor Innovation Scorer   |
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    | Grounded Opportunity Generator|
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    | Strict Evidence Validation    |
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +--------------+---------------+
                                    | React Dashboard + 3D Canvas  |
                                    +------------------------------+
```

---

## 🔑 Environment Configuration & Data Modes

Copy `backend/.env.example` to `backend/.env`:

```bash
cd backend
cp .env.example .env
```

### Live Data Mode (`DATA_MODE=live`)
Set in `backend/.env`:
```env
DATA_MODE=live
OPENALEX_API_KEY=your_key_here
EPO_CONSUMER_KEY=your_epo_consumer_key
EPO_CONSUMER_SECRET=your_epo_consumer_secret
```

### Mock Data Mode (`DATA_MODE=mock`)
```env
DATA_MODE=mock
```
*Mock data mode uses local deterministic fixtures and does not require external API credentials or network connections.*

---

## 📊 6-Factor Operational Innovation Scoring Model

Every identified innovation candidate is evaluated across six operational metrics:

1. **Novelty Potential ($N$)**: Inverse correlation with existing high-similarity prior-art patent claims.
2. **Contextual Relevance ($R$)**: Alignment between retrieved domain literature and the user's proposed technique.
3. **Gap Strength ($G$)**: Quantitative strength of unresolved scientific/patent constraints.
4. **Evidence Strength ($E$)**: Density of validated, non-hallucinated supporting evidence passages.
5. **Feasibility ($F$)**: Technical and computational viability of the proposed approach.
6. **Differentiation ($D$)**: Extent to which the proposed idea bypasses known patent claim boundaries.

---

## 🚀 Getting Started & Local Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 1. Backend Setup & Startup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate

pip install -r requirements.txt
python app/main.py
```
*The FastAPI backend will start at `http://127.0.0.1:8000`. API documentation is available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup & Startup
```bash
cd frontend
npm install
npm run dev
```
*The React + Vite Dashboard will be accessible at `http://localhost:5173`.*

---

## 🧪 Testing & Verification

To run backend unit tests:
```bash
cd backend
python -m pytest tests/unit/test_pipeline_unit.py -v
```

To run baseline evaluation comparison (BM25 vs. FAISS vs. Framework P1):
```bash
python evaluation/evaluate_baselines.py
```

---

## ⚠️ Operational & Legal Disclaimer

> [!CAUTION]
> **Prototype Disclaimer**: The system is a research and decision-support prototype. It MUST NOT claim to establish legal patentability, legal freedom to operate, automated patent filing, or guaranteed commercial success. It clearly distinguishes preliminary computational assessments from decisions requiring legal, technical, intellectual-property, or commercial expertise.
