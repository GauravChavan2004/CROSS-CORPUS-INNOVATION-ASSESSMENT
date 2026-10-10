import numpy as np
from typing import List, Tuple, Dict, Any
from app.api.schemas import ResearchPaper, Patent
from app.retrieval.embeddings import EmbeddingGenerator
from app.logging_config import logger

class VectorIndex:
    """FAISS-backed vector index for document and passage retrieval."""
    def __init__(self, embedding_generator: EmbeddingGenerator = None):
        self.encoder = embedding_generator or EmbeddingGenerator()
        self.index = None
        self.metadata: List[Dict[str, Any]] = []

    def _init_faiss(self, dim: int):
        try:
            import faiss
            self.index = faiss.IndexFlatIP(dim)
        except Exception as e:
            logger.warning(f"Could not import FAISS ({e}). Using Numpy vector index.")
            self.index = None

    def index_documents(self, papers: List[ResearchPaper], patents: List[Patent]):
        self.metadata = []
        texts = []

        for paper in papers:
            text = f"{paper.title}. {paper.abstract or ''}"
            texts.append(text)
            self.metadata.append({
                "doc_id": paper.paper_id,
                "doc_type": "paper",
                "title": paper.title,
                "text": text,
                "source_url": paper.source_url
            })

        for patent in patents:
            claims_text = " ".join(patent.claims or [])
            text = f"{patent.title}. {patent.abstract or ''} Claims: {claims_text}"
            texts.append(text)
            self.metadata.append({
                "doc_id": patent.patent_id,
                "doc_type": "patent",
                "title": patent.title,
                "text": text,
                "source_url": patent.source_url
            })

        if not texts:
            return

        embeddings = self.encoder.encode(texts)
        dim = embeddings.shape[1]
        self._init_faiss(dim)

        if self.index is not None:
            self.index.add(embeddings)
            logger.info(f"FAISS index built with {self.index.ntotal} vectors.")
        else:
            self.embeddings_matrix = embeddings
            logger.info(f"Numpy vector index built with {len(texts)} vectors.")

    def search(self, query: str, doc_type_filter: str = None, top_k: int = 10) -> List[Tuple[str, float, str]]:
        if not self.metadata:
            return []

        query_vector = self.encoder.encode([query])
        results = []

        if self.index is not None:
            scores, indices = self.index.search(query_vector, max(top_k * 2, len(self.metadata)))
            for score, idx in zip(scores[0], indices[0]):
                if idx < 0 or idx >= len(self.metadata):
                    continue
                meta = self.metadata[idx]
                if doc_type_filter and meta["doc_type"] != doc_type_filter:
                    continue
                results.append((meta["doc_id"], float(score), meta["doc_type"]))
        else:
            sims = np.dot(self.embeddings_matrix, query_vector.T).flatten()
            for idx, score in enumerate(sims):
                meta = self.metadata[idx]
                if doc_type_filter and meta["doc_type"] != doc_type_filter:
                    continue
                results.append((meta["doc_id"], float(score), meta["doc_type"]))
            results.sort(key=lambda x: x[1], reverse=True)

        return results[:top_k]
