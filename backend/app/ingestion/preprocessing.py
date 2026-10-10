import re
from typing import List, Tuple, Dict, Any
from app.api.schemas import ResearchPaper, Patent
from app.logging_config import logger

def clean_text(text: str) -> str:
    """Normalize whitespace and remove non-printable characters."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def preprocess_papers(papers: List[ResearchPaper]) -> Tuple[List[ResearchPaper], Dict[str, Any]]:
    """Deduplicate and normalize research paper records."""
    seen_ids = set()
    seen_dois = set()
    clean_list: List[ResearchPaper] = []
    duplicates = 0
    missing_abstracts = 0

    for paper in papers:
        pid = paper.paper_id.strip()
        doi = paper.doi.strip().lower() if paper.doi else None

        if pid in seen_ids or (doi and doi in seen_dois):
            duplicates += 1
            continue

        seen_ids.add(pid)
        if doi:
            seen_dois.add(doi)

        paper.title = clean_text(paper.title)
        paper.abstract = clean_text(paper.abstract) if paper.abstract else None
        if not paper.abstract:
            missing_abstracts += 1
            
        clean_list.append(paper)

    profile = {
        "total_input": len(papers),
        "cleaned_output": len(clean_list),
        "duplicates_removed": duplicates,
        "missing_abstracts": missing_abstracts,
    }
    logger.info(f"Paper Preprocessing Profile: {profile}")
    return clean_list, profile

def preprocess_patents(patents: List[Patent]) -> Tuple[List[Patent], Dict[str, Any]]:
    """Deduplicate and normalize patent records."""
    seen_ids = set()
    clean_list: List[Patent] = []
    duplicates = 0
    missing_claims = 0

    for patent in patents:
        pid = patent.patent_id.strip()
        if pid in seen_ids:
            duplicates += 1
            continue

        seen_ids.add(pid)
        patent.title = clean_text(patent.title)
        patent.abstract = clean_text(patent.abstract) if patent.abstract else None
        patent.description = clean_text(patent.description) if patent.description else None
        
        if patent.claims:
            patent.claims = [clean_text(c) for c in patent.claims if clean_text(c)]
        else:
            missing_claims += 1

        clean_list.append(patent)

    profile = {
        "total_input": len(patents),
        "cleaned_output": len(clean_list),
        "duplicates_removed": duplicates,
        "missing_claims": missing_claims,
    }
    logger.info(f"Patent Preprocessing Profile: {profile}")
    return clean_list, profile
