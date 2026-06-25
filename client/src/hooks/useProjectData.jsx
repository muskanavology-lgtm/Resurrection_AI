import { useState, useEffect, useCallback } from "react";

/**
 * Fetches data via the given async fetcher function whenever projectId changes.
 * fetcher: (id) => Promise<axiosResponse>
 * Returns { data, loading, error, refetch }
 */
export function useProjectData(fetcher, projectId, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher(projectId);
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, ...deps]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
