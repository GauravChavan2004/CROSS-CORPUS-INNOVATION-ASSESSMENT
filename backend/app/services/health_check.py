import base64
import requests
from typing import Dict, Any
from app.config import settings
from app.logging_config import logger

def check_openalex_health(test_query: str = "Recommender system") -> Dict[str, Any]:
    """
    Performs comprehensive diagnostic health check for OpenAlex API.
    Distinguishes:
      - Category A: Credential missing (using polite public pool)
      - Category B: Credential configured but authentication failed (HTTP 401)
      - Category C: Authentication succeeded but data request failed
      - Category D: Authentication succeeded and actual data received
    NEVER exposes the API key or secret values.
    """
    key = settings.clean_openalex_api_key
    configured = bool(key)
    key_length = len(key) if configured else 0
    url = "https://api.openalex.org/works"

    headers = {
        "User-Agent": "CrossCorpusInnovationFramework/1.0 (mailto:research@innovation.org)"
    }
    params = {
        "search": test_query,
        "per_page": 5
    }

    auth_method_attempted = "Bearer Header" if configured else "Polite Public Pool"

    if configured:
        headers["Authorization"] = f"Bearer {key}"

    try:
        resp = requests.get(url, headers=headers, params=params, timeout=settings.OPENALEX_TIMEOUT_SECONDS)
        
        # If Bearer fails with 401, test query-parameter method
        if resp.status_code == 401 and configured:
            headers.pop("Authorization", None)
            params["api_key"] = key
            auth_method_attempted = "Query Parameter (api_key=)"
            resp = requests.get(url, headers=headers, params=params, timeout=settings.OPENALEX_TIMEOUT_SECONDS)

        status_code = resp.status_code

        if status_code == 401:
            return {
                "service": "OpenAlex",
                "configured": True,
                "credential_length": key_length,
                "category": "B: Credential configured but authentication failed",
                "auth_status": "FAILED",
                "http_status": 401,
                "data_received": False,
                "records_received": 0,
                "total_matching": 0,
                "message": "OpenAlex rejected provided API key (HTTP 401)."
            }

        if status_code == 200:
            data = resp.json()
            total_matching = data.get("meta", {}).get("count", 0)
            results = data.get("results", [])
            data_received = len(results) > 0
            
            category = "D: Authentication succeeded and data received" if configured else "D: Public pool access succeeded and data received"
            return {
                "service": "OpenAlex",
                "configured": configured,
                "credential_length": key_length,
                "auth_method": auth_method_attempted,
                "category": category,
                "auth_status": "SUCCESS",
                "http_status": 200,
                "data_received": data_received,
                "records_received": len(results),
                "total_matching": total_matching,
                "sample_title": results[0].get("title", "")[:60] if data_received else None,
                "message": f"Successfully retrieved {len(results)} works (total matching: {total_matching})."
            }
        else:
            return {
                "service": "OpenAlex",
                "configured": configured,
                "credential_length": key_length,
                "category": "C: Authentication succeeded but data request failed",
                "auth_status": "FAILED",
                "http_status": status_code,
                "data_received": False,
                "records_received": 0,
                "total_matching": 0,
                "message": f"HTTP {status_code} returned by OpenAlex."
            }

    except Exception as e:
        logger.error(f"OpenAlex health check exception: {e}")
        return {
            "service": "OpenAlex",
            "configured": configured,
            "credential_length": key_length,
            "category": "C: Authentication succeeded but data request failed" if configured else "A: Credential missing / request failed",
            "auth_status": "ERROR",
            "http_status": 0,
            "data_received": False,
            "records_received": 0,
            "total_matching": 0,
            "message": str(e)
        }


def check_epo_health(test_query: str = "recommender system") -> Dict[str, Any]:
    """
    Performs comprehensive diagnostic health check for EPO OPS API.
    Distinguishes:
      - Category A: Credential missing
      - Category B: Credential configured but authentication failed (HTTP 401)
      - Category C: Authentication succeeded but data request failed
      - Category D: Authentication succeeded and patent data received
    NEVER exposes consumer keys, secrets, or access tokens.
    """
    consumer_key = settings.clean_epo_consumer_key
    consumer_secret = settings.clean_epo_consumer_secret
    configured = bool(consumer_key and consumer_secret)
    key_length = len(consumer_key) if consumer_key else 0
    secret_length = len(consumer_secret) if consumer_secret else 0

    if not configured:
        return {
            "service": "EPO OPS",
            "configured": False,
            "credential_length": 0,
            "category": "A: Credential missing",
            "auth_status": "NOT_CONFIGURED",
            "http_status": 0,
            "token_received": False,
            "search_status": "SKIPPED",
            "records_received": 0,
            "data_received": False,
            "message": "EPO Consumer Key and/or Secret not configured or set to placeholder."
        }

    # Step 1: OAuth Token Generation via HTTP POST + Basic Auth
    auth_url = "https://ops.epo.org/3.2/auth/accesstoken"
    try:
        auth_str = f"{consumer_key}:{consumer_secret}"
        b64_credentials = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
        headers = {
            "Authorization": f"Basic {b64_credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}

        auth_resp = requests.post(auth_url, headers=headers, data=data, timeout=settings.EPO_TIMEOUT_SECONDS)
        
        if auth_resp.status_code == 401:
            return {
                "service": "EPO OPS",
                "configured": True,
                "consumer_key_length": key_length,
                "consumer_secret_length": secret_length,
                "category": "B: Credential configured but authentication failed",
                "auth_status": "FAILED",
                "http_status": 401,
                "token_received": False,
                "search_status": "SKIPPED",
                "records_received": 0,
                "data_received": False,
                "message": "EPO OPS rejected credentials (HTTP 401 ClientId is Invalid)."
            }

        auth_resp.raise_for_status()
        token_data = auth_resp.json()
        token = token_data.get("access_token")

        if not token:
            return {
                "service": "EPO OPS",
                "configured": True,
                "consumer_key_length": key_length,
                "consumer_secret_length": secret_length,
                "category": "B: Credential configured but authentication failed",
                "auth_status": "FAILED",
                "http_status": auth_resp.status_code,
                "token_received": False,
                "search_status": "SKIPPED",
                "records_received": 0,
                "data_received": False,
                "message": "EPO auth endpoint succeeded but returned no access_token."
            }

    except Exception as e:
        logger.error(f"EPO OPS auth exception: {e}")
        return {
            "service": "EPO OPS",
            "configured": True,
            "consumer_key_length": key_length,
            "consumer_secret_length": secret_length,
            "category": "B: Credential configured but authentication failed",
            "auth_status": "FAILED",
            "http_status": 0,
            "token_received": False,
            "search_status": "SKIPPED",
            "records_received": 0,
            "data_received": False,
            "message": str(e)
        }

    # Step 2: Authenticated Search with Token
    try:
        search_url = "https://ops.epo.org/3.2/rest-services/published-data/search"
        search_headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }
        search_params = {
            "q": f'ta="{test_query}"',
            "Range": "1-5"
        }
        search_resp = requests.get(search_url, headers=search_headers, params=search_params, timeout=settings.EPO_TIMEOUT_SECONDS)

        if search_resp.status_code == 200:
            patent_data = search_resp.json()
            world_data = patent_data.get("world-patent-data", {})
            search_res = world_data.get("ops:biblio-search", {})
            total_count = search_res.get("@total-result-count", 0)
            results = search_res.get("ops:search-result", {})
            pub_refs = results.get("ops:publication-reference", [])
            if isinstance(pub_refs, dict):
                pub_refs = [pub_refs]

            return {
                "service": "EPO OPS",
                "configured": True,
                "consumer_key_length": key_length,
                "consumer_secret_length": secret_length,
                "category": "D: Authentication succeeded and data received",
                "auth_status": "SUCCESS",
                "http_status": 200,
                "token_received": True,
                "search_status": "SUCCESS",
                "records_received": len(pub_refs),
                "total_matching": total_count,
                "data_received": len(pub_refs) > 0,
                "message": f"Successfully authenticated and retrieved {len(pub_refs)} patents."
            }
        else:
            return {
                "service": "EPO OPS",
                "configured": True,
                "consumer_key_length": key_length,
                "consumer_secret_length": secret_length,
                "category": "C: Authentication succeeded but data request failed",
                "auth_status": "SUCCESS",
                "http_status": search_resp.status_code,
                "token_received": True,
                "search_status": "FAILED",
                "records_received": 0,
                "data_received": False,
                "message": f"Patent search returned HTTP {search_resp.status_code}."
            }
    except Exception as e:
        logger.error(f"EPO OPS search exception: {e}")
        return {
            "service": "EPO OPS",
            "configured": True,
            "consumer_key_length": key_length,
            "consumer_secret_length": secret_length,
            "category": "C: Authentication succeeded but data request failed",
            "auth_status": "SUCCESS",
            "http_status": 0,
            "token_received": True,
            "search_status": "ERROR",
            "records_received": 0,
            "data_received": False,
            "message": str(e)
        }
