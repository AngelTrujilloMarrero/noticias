const API_BASE = String(import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export async function fetchNews({ signal, force = false } = {}) {
  const query = force ? '?force=1' : '';
  const response = await fetch(`${API_BASE}/api/news${query}`, {
    signal,
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    let detail = '';
    try {
      const payload = await response.json();
      detail = payload?.detail || payload?.error || '';
    } catch {
      // La respuesta no era JSON.
    }
    throw new Error(detail || `El servidor respondió con HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.articles) || !Array.isArray(payload.feeds)) {
    throw new Error('La respuesta del servidor no tiene el formato esperado');
  }

  return payload;
}
