import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNews } from '../services/api.js';

const CLIENT_REFRESH_MS = 60_000;

export function useFeedData() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [nextRefreshAt, setNextRefreshAt] = useState(() => Date.now() + CLIENT_REFRESH_MS);

  const requestRef = useRef(0);
  const nextRefreshRef = useRef(nextRefreshAt);

  useEffect(() => {
    nextRefreshRef.current = nextRefreshAt;
  }, [nextRefreshAt]);

  const load = useCallback(async ({ force = false, background = false } = {}) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (background) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const nextSnapshot = await fetchNews({ force });
      if (requestRef.current !== requestId) return;
      setSnapshot(nextSnapshot);
      setNextRefreshAt(Date.now() + CLIENT_REFRESH_MS);
    } catch (caught) {
      if (requestRef.current !== requestId) return;
      setError(caught?.message || 'No se pudieron cargar las noticias');
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      load({ background: true });
    }, CLIENT_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible' && Date.now() >= nextRefreshRef.current) {
        load({ background: true });
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [load]);

  const refresh = useCallback(() => load({ force: true }), [load]);

  const stop = useCallback(() => {
    requestRef.current += 1;
    setLoading(false);
    setRefreshing(false);
  }, []);

  return {
    snapshot,
    loading,
    refreshing,
    error,
    refresh,
    stop,
    nextRefreshAt,
  };
}
