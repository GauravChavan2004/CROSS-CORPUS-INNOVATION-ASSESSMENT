import time
import base64
import requests
from typing import Optional
from app.config import settings
from app.logging_config import logger

class EPOAuthManager:
    """OAuth 2.0 Client Credentials Authentication Manager for EPO OPS API."""

    AUTH_URL = "https://ops.epo.org/3.2/auth/accesstoken"

    def __init__(self, consumer_key: str = None, consumer_secret: str = None, timeout: int = None):
        self.consumer_key = consumer_key if consumer_key is not None else settings.clean_epo_consumer_key
        self.consumer_secret = consumer_secret if consumer_secret is not None else settings.clean_epo_consumer_secret
        self.timeout = timeout or settings.EPO_TIMEOUT_SECONDS
        
        self._access_token: Optional[str] = None
        self._token_expires_at: float = 0.0

    def get_valid_token(self) -> Optional[str]:
        """Returns a valid in-memory cached access token or fetches a fresh one if expired."""
        if not self.consumer_key or not self.consumer_secret:
            logger.info("EPO Consumer Key or Secret not configured (or placeholder). EPO OPS Auth inactive.")
            return None

        # Check if cached token is still valid (with 60-second buffer)
        if self._access_token and time.time() < (self._token_expires_at - 60):
            return self._access_token

        return self._fetch_access_token()

    def _fetch_access_token(self) -> Optional[str]:
        try:
            logger.info("Requesting fresh OAuth access token from EPO OPS auth endpoint...")
            auth_str = f"{self.consumer_key}:{self.consumer_secret}"
            b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

            headers = {
                "Authorization": f"Basic {b64_auth}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            data = {"grant_type": "client_credentials"}

            response = requests.post(self.AUTH_URL, headers=headers, data=data, timeout=self.timeout)
            response.raise_for_status()

            json_resp = response.json()
            token = json_resp.get("access_token")
            expires_in = int(json_resp.get("expires_in", 1200))

            if token:
                self._access_token = token
                self._token_expires_at = time.time() + expires_in
                logger.info(f"EPO OPS access token obtained successfully (expires in {expires_in}s).")
                return self._access_token
            else:
                logger.error("EPO OPS auth endpoint response did not contain access_token.")
                return None

        except Exception as e:
            logger.error(f"Failed to authenticate with EPO OPS endpoint: {e}")
            return None
