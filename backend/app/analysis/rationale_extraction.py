import re
import uuid
from typing import List, Dict, Any, Tuple
from app.api.schemas import ResearchPaper, Patent, EvidenceRecord
from app.logging_config import logger

class RationaleExtractor:
    """Extracts structured technical fields and passage-level evidence from papers and patents."""

    LIMITATION_KEYWORDS = ["limitation", "fail", "struggle", "unable", "lack", "drawback", "noise", "sensitivity", "degrades", "missing", "sparse", "exclude", "variance"]
    ADVANTAGE_KEYWORDS = ["improve", "speedup", "achieve", "enhance", "outperform", "efficient", "accuracy", "reducing", "novel"]
    METHOD_KEYWORDS = ["propose", "present", "develop", "using", "architecture", "algorithm", "method", "apparatus", "system"]

    def extract_from_papers(self, papers: List[ResearchPaper]) -> Tuple[Dict[str, Dict[str, Any]], List[EvidenceRecord]]:
        rationales = {}
        evidence_list = []

        for paper in papers:
            text = f"{paper.title}. {paper.abstract or ''}"
            sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', text) if s.strip()]

            paper_limitations = []
            paper_advantages = []
            paper_methods = []

            for idx, s in enumerate(sentences):
                s_lower = s.lower()
                # Extract Limitations
                if any(kw in s_lower for kw in self.LIMITATION_KEYWORDS):
                    ev_id = f"EV-PLIM-{uuid.uuid4().hex[:6]}"
                    paper_limitations.append({
                        "text": s,
                        "evidence_id": ev_id
                    })
                    evidence_list.append(EvidenceRecord(
                        evidence_id=ev_id,
                        document_id=paper.paper_id,
                        document_type="paper",
                        passage_text=s,
                        source_url=paper.source_url,
                        passage_location=f"sentence_{idx+1}",
                        evidence_type="limitation",
                        extraction_method="rule_based_keyword_span",
                        confidence=0.9
                    ))

                # Extract Advantages
                if any(kw in s_lower for kw in self.ADVANTAGE_KEYWORDS):
                    ev_id = f"EV-PADV-{uuid.uuid4().hex[:6]}"
                    paper_advantages.append({
                        "text": s,
                        "evidence_id": ev_id
                    })
                    evidence_list.append(EvidenceRecord(
                        evidence_id=ev_id,
                        document_id=paper.paper_id,
                        document_type="paper",
                        passage_text=s,
                        source_url=paper.source_url,
                        passage_location=f"sentence_{idx+1}",
                        evidence_type="advantage",
                        extraction_method="rule_based_keyword_span",
                        confidence=0.85
                    ))

                # Extract Methods
                if any(kw in s_lower for kw in self.METHOD_KEYWORDS):
                    ev_id = f"EV-PMETH-{uuid.uuid4().hex[:6]}"
                    paper_methods.append({
                        "text": s,
                        "evidence_id": ev_id
                    })
                    evidence_list.append(EvidenceRecord(
                        evidence_id=ev_id,
                        document_id=paper.paper_id,
                        document_type="paper",
                        passage_text=s,
                        source_url=paper.source_url,
                        passage_location=f"sentence_{idx+1}",
                        evidence_type="method",
                        extraction_method="rule_based_keyword_span",
                        confidence=0.85
                    ))

            rationales[paper.paper_id] = {
                "problem_addressed": paper.title,
                "objective": paper.abstract[:150] if paper.abstract else paper.title,
                "methods": paper_methods,
                "advantages": paper_advantages,
                "limitations": paper_limitations,
                "keywords": paper.keywords
            }

        return rationales, evidence_list

    def extract_from_patents(self, patents: List[Patent]) -> Tuple[Dict[str, Dict[str, Any]], List[EvidenceRecord]]:
        rationales = {}
        evidence_list = []

        for patent in patents:
            desc = patent.description or ""
            claims = " ".join(patent.claims or [])
            full_text = f"{patent.title}. {patent.abstract or ''} {claims} {desc}"
            sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', full_text) if s.strip()]

            patent_limitations = []
            patent_solutions = []

            for idx, s in enumerate(sentences):
                s_lower = s.lower()
                if any(kw in s_lower for kw in self.LIMITATION_KEYWORDS):
                    ev_id = f"EV-TLIM-{uuid.uuid4().hex[:6]}"
                    patent_limitations.append({
                        "text": s,
                        "evidence_id": ev_id
                    })
                    evidence_list.append(EvidenceRecord(
                        evidence_id=ev_id,
                        document_id=patent.patent_id,
                        document_type="patent",
                        passage_text=s,
                        source_url=patent.source_url,
                        passage_location=f"sentence_{idx+1}",
                        evidence_type="limitation",
                        extraction_method="rule_based_keyword_span",
                        confidence=0.9
                    ))

                if "claim" in s_lower or "comprising" in s_lower or "apparatus" in s_lower:
                    ev_id = f"EV-TSOL-{uuid.uuid4().hex[:6]}"
                    patent_solutions.append({
                        "text": s,
                        "evidence_id": ev_id
                    })
                    evidence_list.append(EvidenceRecord(
                        evidence_id=ev_id,
                        document_id=patent.patent_id,
                        document_type="patent",
                        passage_text=s,
                        source_url=patent.source_url,
                        passage_location=f"sentence_{idx+1}",
                        evidence_type="solution",
                        extraction_method="claims_extraction",
                        confidence=0.95
                    ))

            rationales[patent.patent_id] = {
                "title": patent.title,
                "classifications": patent.classifications,
                "solutions": patent_solutions,
                "limitations": patent_limitations,
                "assignee": patent.assignee
            }

        return rationales, evidence_list
