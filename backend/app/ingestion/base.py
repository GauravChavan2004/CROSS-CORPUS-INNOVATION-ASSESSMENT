from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.api.schemas import ResearchPaper, Patent

class BasePaperAdapter(ABC):
    """Abstract interface for paper data ingestion."""
    @abstractmethod
    def fetch_papers(self, query: str, limit: int = 10) -> List[ResearchPaper]:
        pass

class BasePatentAdapter(ABC):
    """Abstract interface for patent data ingestion."""
    @abstractmethod
    def fetch_patents(self, query: str, limit: int = 10) -> List[Patent]:
        pass
