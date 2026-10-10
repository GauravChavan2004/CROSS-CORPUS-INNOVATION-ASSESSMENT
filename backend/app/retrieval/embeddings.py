import numpy as np
from typing import List
from app.config import settings
from app.logging_config import logger

class EmbeddingGenerator:
    """Wrapper for SentenceTransformer embedding generation with graceful offline fallback."""
    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL_NAME
        self.model = None
        self.dimension = settings.VECTOR_DIMENSION
        self._init_model()

    def _init_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            self.dimension = self.model.get_sentence_embedding_dimension()
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer ({e}). Using deterministic feature encoder.")
            self.model = None

    def encode(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension), dtype=np.float32)

        if self.model is not None:
            embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
            # Normalize for cosine similarity
            norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
            norms[norms == 0] = 1e-10
            return (embeddings / norms).astype(np.float32)

        # Fallback deterministic hashing encoder for offline execution
        vectors = []
        for text in texts:
            vec = np.zeros(self.dimension, dtype=np.float32)
            words = text.lower().split()
            for word in words:
                idx = abs(hash(word)) % self.dimension
                vec[idx] += 1.0
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            vectors.append(vec)
        return np.array(vectors, dtype=np.float32)
