# Data Source Integration Specifications & API Documentation

This document specifies the technical details, endpoints, authentication mechanics, field mappings, rate limits, and fallback strategies for the live data providers in the **Cross-Corpus Innovation Assessment System**.

---

## 1. Research Papers API: OpenAlex

* **Provider**: OpenAlex (OurResearch)
* **Base URL**: `https://api.openalex.org/works`
* **Official Documentation**: https://help.openalex.org/
* **Adapter Implementation**: `OpenAlexPaperAdapter` (`backend/app/ingestion/papers.py`)

### Authentication & Headers
* **Environment Variable**: `OPENALEX_API_KEY`
* **Request Header**: `User-Agent: CrossCorpusInnovationFramework/1.0`
* **Auth Method**: API key parameter `api_key` if configured, or polite public tier request header.

### Request & Retrieval Parameters
```http
GET https://api.openalex.org/works?search={query}&per_page={PAPER_CANDIDATE_LIMIT}&sort=relevance_score:desc
```
* `search`: User research query string.
* `per_page`: Configurable result limit (default: 50 candidates).
* `sort`: Sorted by relevance score descending.

### Internal Schema Mapping (`ResearchPaper`)
| Internal Field | OpenAlex Response Property | Notes / Logic |
| :--- | :--- | :--- |
| `paper_id` | `id` | OpenAlex IRI (e.g. `https://openalex.org/W2741809807`) |
| `title` | `title` | Publication title |
| `abstract` | `abstract_inverted_index` | Deterministically reconstructed using index position mapping |
| `authors` | `authorships[].author.display_name` | Extracted author display names |
| `publication_year` | `publication_year` | Integer year |
| `doi` | `doi` | DOI URL / string |
| `keywords` | `concepts[].display_name` + `keywords` | Top technical concepts and topic tags |
| `source_url` | `doi` / `primary_location.landing_page_url` | Verified publication URL |
| `references` | `referenced_works` | List of OpenAlex referenced work IDs |
| `source_provider` | Constant `"openalex"` | Provenance tracking tag |

### Abstract Inverted Index Reconstruction
OpenAlex stores abstracts as an inverted index dictionary: `{"word": [pos1, pos2], ...}`.
`OpenAlexPaperAdapter` converts this to plain text by:
1. Identifying maximum index position $M = \max_{pos} \text{pos}$.
2. Initializing an array of size $M + 1$.
3. Placing each word into its exact index positions.
4. Joining with spaces. If no abstract index exists, `abstract` is set to `null` without fabricating data.

---

## 2. Patent Literature API: European Patent Office (EPO) OPS

* **Provider**: European Patent Office Open Patent Services (OPS v3.2)
* **Auth Endpoint**: `https://ops.epo.org/3.2/auth/accesstoken`
* **Search Endpoint**: `https://ops.epo.org/3.2/rest-services/published-data/search`
* **Documentation**: https://www.epo.org/en/service-support/open-patent-services
* **Adapter Implementation**: `EPOPatentAdapter` (`backend/app/ingestion/patents.py`) & `EPOAuthManager` (`backend/app/ingestion/epo_auth.py`)

### OAuth 2.0 Authentication Flow
* **Environment Variables**: `EPO_CONSUMER_KEY`, `EPO_CONSUMER_SECRET`
* **Auth Method**: OAuth Client Credentials Flow
* **Header**: `Authorization: Basic <base64(EPO_CONSUMER_KEY:EPO_CONSUMER_SECRET)>`
* **Body**: `grant_type=client_credentials`
* **Token Caching**: `EPOAuthManager` caches the `access_token` in memory for its full validity period (1200 seconds) with a 60-second refresh buffer. Tokens are never logged or written to disk.

### Search Query & Parameters
```http
GET https://ops.epo.org/3.2/rest-services/published-data/search?q=ta="{query}"&Range=1-{PATENT_CANDIDATE_LIMIT}
Headers: Authorization: Bearer <access_token>, Accept: application/json
```

### Internal Schema Mapping (`Patent`)
| Internal Field | EPO OPS Response Property | Notes / Logic |
| :--- | :--- | :--- |
| `patent_id` | `document-id.country` + `doc-number` + `kind` | Official publication number (e.g. `EP3456789A1`) |
| `application_id` | `APP-` + `doc-number` | Application identifier |
| `title` | `bibliographic-data.invention-title` | Title of invention |
| `abstract` | Abstract summary / biblio text | Set to summary text |
| `claims` | Claims list / `null` | Set to `null` if search response omits full claims text |
| `publication_date` | `document-id.date` | Date string |
| `classifications` | `patent-classifications.patent-classification` | CPC / IPC classification codes |
| `assignee` | `parties.applicants.applicant.applicant-name` | Applicant / Assignee entity name |
| `source_url` | `https://worldwide.espacenet.com/patent/search?q=pn%3D{patent_id}` | Espacenet reference link |
| `source_provider` | Constant `"epo_ops"` | Provenance tracking tag |

---

## 3. Operational Data Modes & Error Handling

### Dual Operational Modes (`DATA_MODE`)
1. **`DATA_MODE=live`**:
   - Fetches live papers from OpenAlex and patents from EPO OPS.
   - Requires `OPENALEX_API_KEY`, `EPO_CONSUMER_KEY`, and `EPO_CONSUMER_SECRET` in `backend/.env`.
2. **`DATA_MODE=mock`**:
   - Uses deterministic local test fixtures (`data/fixtures/papers.json` & `data/fixtures/patents.json`).
   - Does not require network access or API credentials. Ideal for unit testing and offline demonstrations.

### Partial Provider Success (`status="partial_success"`)
If one provider succeeds while the other fails or is unavailable due to rate limits:
- The system returns the successfully retrieved corpus.
- The pipeline sets response `status="partial_success"`.
- Detailed warning messages are attached to `response.warnings`.
- Synthetic data is **never** silently injected into live results.
