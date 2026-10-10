import os
import sys
import base64
import requests
from pathlib import Path
from dotenv import dotenv_values

backend_dir = Path(__file__).resolve().parent.parent
env_path = backend_dir / ".env"

print("=" * 60)
print("1. ENVIRONMENT LOADING CHECK")
print("=" * 60)
print(f"Backend directory: {backend_dir}")
print(f".env file path: {env_path}")
print(f".env file exists: {'YES' if env_path.exists() else 'NO'}")

if not env_path.exists():
    print("CRITICAL: .env file not found!")
    sys.exit(1)

# Read raw .env values safely
raw_env = dotenv_values(str(env_path))

openalex_key_raw = raw_env.get("OPENALEX_API_KEY") or ""
openalex_key = openalex_key_raw.strip().strip("'\"")

epo_key_raw = raw_env.get("EPO_CONSUMER_KEY") or ""
epo_key = epo_key_raw.strip().strip("'\"")

epo_secret_raw = raw_env.get("EPO_CONSUMER_SECRET") or ""
epo_secret = epo_secret_raw.strip().strip("'\"")

print("\nCredential Configuration Summary (NO SECRETS PRINTED):")
print(f"- OPENALEX_API_KEY:")
print(f"    Configured: {'YES' if bool(openalex_key) else 'NO'}")
print(f"    Raw length: {len(openalex_key_raw)}, Clean length: {len(openalex_key)}")
print(f"    Whitespace present: {'YES' if openalex_key_raw != openalex_key else 'NO'}")

print(f"- EPO_CONSUMER_KEY:")
print(f"    Configured: {'YES' if bool(epo_key) else 'NO'}")
print(f"    Raw length: {len(epo_key_raw)}, Clean length: {len(epo_key)}")
print(f"    Whitespace present: {'YES' if epo_key_raw != epo_key else 'NO'}")

print(f"- EPO_CONSUMER_SECRET:")
print(f"    Configured: {'YES' if bool(epo_secret) else 'NO'}")
print(f"    Raw length: {len(epo_secret_raw)}, Clean length: {len(epo_secret)}")
print(f"    Whitespace present: {'YES' if epo_secret_raw != epo_secret else 'NO'}")

print("\n" + "=" * 60)
print("2. OPENALEX API DIAGNOSTIC")
print("=" * 60)

openalex_url = "https://api.openalex.org/works"
query_term = "Research and Patent based Recommender system"

# Method A: Bearer Token in Header
print("\n[Diagnostic A] OpenAlex with Authorization: Bearer <key>")
try:
    headers_bearer = {
        "Authorization": f"Bearer {openalex_key}",
        "User-Agent": "CrossCorpusResearchDiagnostic/1.0 (mailto:diagnostic@research.org)"
    }
    params_bearer = {
        "search": query_term,
        "per_page": 50
    }
    resp_bearer = requests.get(openalex_url, headers=headers_bearer, params=params_bearer, timeout=15)
    print(f"HTTP status: {resp_bearer.status_code}")
    if resp_bearer.status_code == 200:
        data = resp_bearer.json()
        count = data.get("meta", {}).get("count", 0)
        results = data.get("results", [])
        print(f"Authentication/request: SUCCESS")
        print(f"Total matching records: {count}")
        print(f"Records received: {len(results)}")
        print(f"Data received: {'YES' if len(results) > 0 else 'NO'}")
        if len(results) > 0:
            print(f"Sample work title: '{results[0].get('title', 'N/A')[:60]}...'")
    else:
        print(f"Authentication/request: FAILED")
        print(f"Response: {resp_bearer.text[:200]}")
except Exception as e:
    print(f"Request exception: {e}")

# Method B: Query Parameter api_key=<key>
print("\n[Diagnostic B] OpenAlex with query parameter ?api_key=<key>")
try:
    headers_param = {
        "User-Agent": "CrossCorpusResearchDiagnostic/1.0 (mailto:diagnostic@research.org)"
    }
    params_param = {
        "search": query_term,
        "per_page": 50,
        "api_key": openalex_key
    }
    resp_param = requests.get(openalex_url, headers=headers_param, params=params_param, timeout=15)
    print(f"HTTP status: {resp_param.status_code}")
    if resp_param.status_code == 200:
        data = resp_param.json()
        count = data.get("meta", {}).get("count", 0)
        results = data.get("results", [])
        print(f"Authentication/request: SUCCESS")
        print(f"Total matching records: {count}")
        print(f"Records received: {len(results)}")
        print(f"Data received: {'YES' if len(results) > 0 else 'NO'}")
    else:
        print(f"Authentication/request: FAILED")
        print(f"Response: {resp_param.text[:200]}")
except Exception as e:
    print(f"Request exception: {e}")


print("\n" + "=" * 60)
print("3. EPO OPS API DIAGNOSTIC")
print("=" * 60)

epo_auth_url = "https://ops.epo.org/3.2/auth/accesstoken"
epo_token = None

print("[Diagnostic] EPO OPS Token Generation:")
try:
    auth_str = f"{epo_key}:{epo_secret}"
    b64_credentials = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
    
    headers_epo = {
        "Authorization": f"Basic {b64_credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data_epo = {
        "grant_type": "client_credentials"
    }
    
    auth_resp = requests.post(epo_auth_url, headers=headers_epo, data=data_epo, timeout=15)
    print(f"HTTP status: {auth_resp.status_code}")
    if auth_resp.status_code == 200:
        token_data = auth_resp.json()
        epo_token = token_data.get("access_token")
        expires_in = token_data.get("expires_in")
        print("Authentication: SUCCESS")
        print(f"Token received: {'YES' if bool(epo_token) else 'NO'}")
        print(f"Expires in: {expires_in}s")
    else:
        print("Authentication: FAILED")
        print(f"Response: {auth_resp.text[:300]}")
except Exception as e:
    print(f"EPO Auth request exception: {e}")

if epo_token:
    print("\n[Diagnostic] EPO OPS Patent Search with Token:")
    try:
        search_url = "https://ops.epo.org/3.2/rest-services/published-data/search"
        search_headers = {
            "Authorization": f"Bearer {epo_token}",
            "Accept": "application/json"
        }
        search_params = {
            "q": 'ta="recommender system"',
            "Range": "1-10"
        }
        search_resp = requests.get(search_url, headers=search_headers, params=search_params, timeout=15)
        print(f"Patent search HTTP status: {search_resp.status_code}")
        if search_resp.status_code == 200:
            patent_data = search_resp.json()
            # check results
            world_data = patent_data.get("world-patent-data", {})
            search_res = world_data.get("ops:biblio-search", {})
            total_count = search_res.get("@total-result-count", "Unknown")
            results = search_res.get("ops:search-result", {})
            publication_refs = results.get("ops:publication-reference", [])
            if isinstance(publication_refs, dict):
                publication_refs = [publication_refs]
            print("Patent search: SUCCESS")
            print(f"Total matching patents: {total_count}")
            print(f"Records received: {len(publication_refs)}")
            print(f"Actual data: {'YES' if len(publication_refs) > 0 else 'NO'}")
        else:
            print(f"Patent search FAILED: {search_resp.text[:200]}")
    except Exception as e:
        print(f"Patent search exception: {e}")
else:
    print("Skipping patent search because token was not received.")

print("\n" + "=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)
