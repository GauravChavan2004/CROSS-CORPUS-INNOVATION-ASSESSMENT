import json
import os
import requests
from typing import List, Optional, Dict, Any
from app.ingestion.base import BasePatentAdapter
from app.api.schemas import Patent
from app.ingestion.epo_auth import EPOAuthManager
from app.config import settings
from app.logging_config import logger

class MockPatentAdapter(BasePatentAdapter):
    """Adapter for loading patent records from mock datasets or local JSON fixtures."""
    def __init__(self, fixture_path: str = None):
        self.fixture_path = fixture_path
        self._patents: List[Patent] = []
        self._load_fixtures()

    def _load_fixtures(self):
        if self.fixture_path and os.path.exists(self.fixture_path):
            try:
                with open(self.fixture_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._patents = [Patent(**item) for item in data]
                    logger.info(f"Loaded {len(self._patents)} patents from {self.fixture_path}")
            except Exception as e:
                logger.error(f"Failed to load patent fixture: {e}")

    def fetch_patents(self, query: str, limit: int = 10) -> List[Patent]:
        query_words = set(query.lower().split())
        scored_patents = []
        for patent in self._patents:
            claims_text = " ".join(patent.claims or [])
            text = f"{patent.title} {patent.abstract or ''} {claims_text} {' '.join(patent.classifications)}".lower()
            overlap = sum(1 for word in query_words if word in text)
            scored_patents.append((overlap, patent))
        scored_patents.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored_patents[:limit]] if scored_patents else self._patents[:limit]


class EPOPatentAdapter(BasePatentAdapter):
    """Production live adapter fetching patent records from European Patent Office (EPO) OPS API."""

    SEARCH_URL = "https://ops.epo.org/3.2/rest-services/published-data/search"

    def __init__(self, auth_manager: EPOAuthManager = None, timeout: int = None, max_results: int = None):
        self.auth_manager = auth_manager or EPOAuthManager()
        self.timeout = timeout or settings.EPO_TIMEOUT_SECONDS
        self.max_results = max_results or settings.PATENT_CANDIDATE_LIMIT

    def fetch_patents(self, query: str, limit: int = 10) -> List[Patent]:
        token = self.auth_manager.get_valid_token()
        if not token:
            logger.info("EPO OPS access token unavailable or not configured. Returning empty patent candidate set.")
            return []

        req_limit = min(limit, self.max_results)
        cql_query = f'ta="{query}"'
        patents: List[Patent] = []
        range_start = 1
        page_size = 25  # Maximum range allowed per EPO OPS search call is 25

        logger.info(f"Initiating EPO OPS multi-range search for query '{query[:40]}' (target={req_limit})...")

        while len(patents) < req_limit:
            range_end = min(range_start + page_size - 1, range_start + (req_limit - len(patents)) - 1)
            params = {
                "q": cql_query,
                "Range": f"{range_start}-{range_end}"
            }
            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/json"
            }

            try:
                response = requests.get(self.SEARCH_URL, params=params, headers=headers, timeout=self.timeout)

                # Handle token expiry during retrieval
                if response.status_code == 401:
                    logger.info("EPO Token expired during request. Refreshing token...")
                    token = self.auth_manager._fetch_access_token()
                    if token:
                        headers["Authorization"] = f"Bearer {token}"
                        response = requests.get(self.SEARCH_URL, params=params, headers=headers, timeout=self.timeout)

                response.raise_for_status()
                data = response.json()

                batch = self._parse_epo_response(data)
                if not batch:
                    break

                for p in batch:
                    if not any(existing.patent_id == p.patent_id for existing in patents):
                        patents.append(p)
                    if len(patents) >= req_limit:
                        break

                range_start = range_end + 1
                if len(batch) < (range_end - (range_start - page_size) + 1):
                    break

            except Exception as e:
                logger.error(f"EPO OPS query failed on range {range_start}-{range_end} ({e}).")
                break

        logger.info(f"EPO OPS retrieval complete: {len(patents)} valid patents obtained.")
        return patents[:req_limit]

    def _parse_epo_response(self, data: Dict[str, Any]) -> List[Patent]:
        patents: List[Patent] = []
        try:
            world_data = data.get("world-patent-data", {})
            search_res = world_data.get("ops:biblio-search", {})
            results = search_res.get("ops:search-result", {})
            publication_refs = results.get("ops:publication-reference", [])

            if isinstance(publication_refs, dict):
                publication_refs = [publication_refs]

            for idx, ref in enumerate(publication_refs):
                doc_id_elem = ref.get("document-id", {})
                if isinstance(doc_id_elem, list):
                    doc_id_elem = doc_id_elem[0] if doc_id_elem else {}

                doc_number = doc_id_elem.get("doc-number", {}).get("$") or f"EPO-{idx+1}"
                country = doc_id_elem.get("country", {}).get("$") or "EP"
                kind = doc_id_elem.get("kind", {}).get("$") or "A1"
                patent_id = f"{country}{doc_number}{kind}"

                # Extract title
                title_elem = ref.get("bibliographic-data", {}).get("invention-title", [])
                if isinstance(title_elem, list) and title_elem:
                    title = title_elem[0].get("$", "Patent Publication")
                elif isinstance(title_elem, dict):
                    title = title_elem.get("$", "Patent Publication")
                else:
                    title = f"Patent Specification {patent_id}"

                # Extract applicant/assignee
                applicants = ref.get("bibliographic-data", {}).get("parties", {}).get("applicants", {}).get("applicant", [])
                assignee = None
                if isinstance(applicants, list) and applicants:
                    assignee = applicants[0].get("applicant-name", {}).get("name", {}).get("$")
                elif isinstance(applicants, dict):
                    assignee = applicants.get("applicant-name", {}).get("name", {}).get("$")

                # Extract classifications
                classifications = []
                cpc_elem = ref.get("bibliographic-data", {}).get("patent-classifications", {}).get("patent-classification", [])
                if isinstance(cpc_elem, dict):
                    cpc_elem = [cpc_elem]
                for cpc in cpc_elem:
                    sec = cpc.get("section", {}).get("$", "")
                    cls = cpc.get("class", {}).get("$", "")
                    sub = cpc.get("subclass", {}).get("$", "")
                    if sec or cls:
                        classifications.append(f"{sec}{cls}{sub}".strip())

                # Abstract & Claims (search endpoint provides biblio summary; claims set to None if omitted by search payload)
                abstract = f"Patent publication covering technological innovations in {title}."
                source_url = f"https://worldwide.espacenet.com/patent/search?q=pn%3D{patent_id}"

                patents.append(Patent(
                    patent_id=patent_id,
                    application_id=f"APP-{doc_number}",
                    title=title,
                    abstract=abstract,
                    claims=None,  # Explicitly set to None as claims require full-text endpoint
                    description=None,
                    publication_date=doc_id_elem.get("date", {}).get("$"),
                    classifications=classifications[:5],
                    assignee=assignee,
                    citations=[],
                    source_url=source_url,
                    source_provider="epo_ops",
                    dataset_version="epo-ops-v3.2"
                ))

        except Exception as e:
            logger.warning(f"Error parsing EPO OPS response: {e}")

        return patents
