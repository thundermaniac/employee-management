import { useCallback, useEffect, useRef, useState } from 'react';
import { listEmployees } from '../api/employees';
import { toApiError } from '../api/client';

/**
 * Owns the employee listing request: pagination, search/filter params, loading
 * and error state. Overlapping requests are aborted so a slow earlier response
 * can never overwrite a newer one.
 */
export default function useEmployees(params) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const key = JSON.stringify(params);

  const fetchPage = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await listEmployees(JSON.parse(key), { signal: controller.signal });
      setData(result);
    } catch (err) {
      if (err.code === 'ERR_CANCELED') return;
      setError(toApiError(err));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    fetchPage();
    return () => controllerRef.current?.abort();
  }, [fetchPage]);

  return { ...data, loading, error, refetch: fetchPage };
}
