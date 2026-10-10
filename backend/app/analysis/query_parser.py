import uuid
import re
from app.api.schemas import AnalysisRequest, ResearchIdea

class QueryParser:
    """Parses raw user research text into structured components."""

    def parse_idea(self, request: AnalysisRequest) -> ResearchIdea:
        text = request.idea_text.strip()
        
        # Domain parsing
        domain = request.domain or "Artificial Intelligence & Biotechnology"
        if "drug" in text.lower() or "binding" in text.lower() or "affinity" in text.lower():
            domain = "AI-Driven Drug Discovery & Bioinformatics"
        elif "material" in text.lower() or "quantum" in text.lower():
            domain = "Quantum Computing & Materials Science"

        # Technology extraction
        tech = getattr(request, 'proposed_technology', None) or "Graph Neural Networks & Transformer Attention"
        if "graph" in text.lower():
            tech = "Graph Neural Networks & Spatial Attention"
        elif "quantum" in text.lower():
            tech = "Quantum Variational Feature Maps"

        # Problem extraction
        problem = text[:120] + "..." if len(text) > 120 else text

        return ResearchIdea(
            idea_id=f"IDEA-{uuid.uuid4().hex[:6]}",
            original_text=text,
            parsed_problem=problem,
            domain=domain,
            proposed_technology=tech,
            objective=request.objective or "Predict binding affinity while overcoming 3D dynamic structural limitations",
            application_area=request.application_area or "Virtual High-Throughput Screening",
            constraints=request.constraints or ["Explainability required", "Sub-second inference target"]
        )
