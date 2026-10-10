const API_BASE = 'http://127.0.0.1:8000/api';

export async function analyzeIdea(payload) {
  const response = await fetch(`${API_BASE}/ideas/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Analysis request failed.');
  }
  return await response.json();
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return await response.json();
}
